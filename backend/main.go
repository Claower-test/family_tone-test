package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/handlers"
	"github.com/family_tone/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func checkStaticFiles() {
	cwd, _ := os.Getwd()
	log.Printf("[DIAGNOSTIC] Current Working Directory: %s", cwd)
	
	pathsToCheck := []string{
		"./backend/static/index.html",
		"./static/index.html",
		"static/index.html",
	}
	
	for _, p := range pathsToCheck {
		if _, err := os.Stat(p); err == nil {
			log.Printf("[DIAGNOSTIC] Found index.html at: %s", p)
			return
		}
	}
	log.Println("[DIAGNOSTIC] WARNING: index.html NOT FOUND in any common location!")
}

func main() {
	checkStaticFiles()
	// Initialize Database
	db.InitDB()
	defer db.DB.Close()

	// Set GIN mode from environment
	if mode := os.Getenv("GIN_MODE"); mode != "" {
		gin.SetMode(mode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	
	// Diagnostic Logger Middleware
	r.Use(func(c *gin.Context) {
		log.Printf("[DIAGNOSTIC] %s %s from %s", c.Request.Method, c.Request.URL.Path, c.ClientIP())
		if c.Request.Method == "OPTIONS" {
			log.Println("[DIAGNOSTIC] Handling OPTIONS preflight")
		}
		c.Next()
	})

	// Global Diagnostic Headers
	r.Use(func(c *gin.Context) {
		c.Header("X-Engine", "Family-Tone-Go")
		c.Header("X-Deployment-Time", "2026-04-12")
		c.Next()
	})

	// CORS — allow all and handle OPTIONS explicitly
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With", "X-Engine"},
		ExposeHeaders:    []string{"Content-Length", "X-Engine"},
		AllowCredentials: true,
	}))

	// Global OPTIONS handler to prevent 405s on preflight
	r.OPTIONS("/*any", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	// ─── API Routes ──────────────────────────────────────────────────────────
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/logout", handlers.Logout)
		}

		api.GET("/records/public", middleware.OptionalAuthMiddleware(), handlers.GetPublicRecords)
		api.GET("/records/:id/comments", middleware.OptionalAuthMiddleware(), handlers.GetComments)
		api.GET("/users/:id/profile", middleware.OptionalAuthMiddleware(), handlers.GetUserProfile)

		// Uploads (served as static files)
		r.Static("/api/uploads/records", "./backend/uploads")
		r.Static("/api/uploads/avatars", "./backend/uploads/avatars")

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/records", handlers.GetRecords)
			protected.POST("/records/upload", handlers.UploadRecord)
			protected.POST("/records/:id/toggle-public", handlers.TogglePublic)

			// User Profile
			protected.GET("/user/profile", handlers.GetUserInfo)
			protected.PUT("/user/profile", handlers.UpdateProfile)
			protected.PUT("/user/password", handlers.ChangePassword)

			// Social Interactions
			protected.POST("/:type/:id/reaction", handlers.ToggleReaction)
			protected.POST("/records/:id/comments", handlers.AddComment)
			protected.PUT("/comments/:id", handlers.UpdateComment)
			protected.DELETE("/comments/:id", handlers.DeleteComment)
			protected.POST("/users/:user_id/follow", handlers.ToggleFollow)
		}
	}

	// ─── Frontend static files ───────────────────────────────────────────────
	// Serve built Vite assets
	r.Static("/assets", "./backend/static/assets")

	// Serve other static files from dist root (favicon, icons, etc.)
	// This covers /favicon.svg, /icons.svg etc.
	r.StaticFS("/public_files", http.Dir("./backend/static"))

	// SPA fallback — for any non-API route serve index.html
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "api route not found"})
			return
		}

		// Try to serve the file directly if it exists in static
		if _, err := os.Stat("./backend/static" + path); err == nil && path != "/" {
			c.File("./backend/static" + path)
			return
		}

		c.File("./backend/static/index.html")
	})

	// ─── Start server ─────────────────────────────────────────────────────────
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
