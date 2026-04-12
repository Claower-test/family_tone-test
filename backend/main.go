package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/handlers"
	"github.com/family_tone/internal/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Database
	db.InitDB()
	defer db.DB.Close()

	// Set GIN mode from environment
	if mode := os.Getenv("GIN_MODE"); mode != "" {
		gin.SetMode(mode)
	}

	r := gin.Default()

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
		r.Static("/api/uploads/records", "./uploads")
		r.Static("/api/uploads/avatars", "./uploads/avatars")

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
	r.Static("/assets", "./static/assets")

	// Serve other static files from dist root (favicon, icons, etc.)
	r.StaticFS("/public", http.Dir("./static"))

	// SPA fallback — for any non-API route serve index.html
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "api route not found"})
			return
		}
		c.File("./static/index.html")
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
