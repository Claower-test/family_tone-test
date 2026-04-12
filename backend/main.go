package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/handlers"
	"github.com/family_tone/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func findStaticFile(filename string) string {
	cwd, _ := os.Getwd()
	// Try multiple possible locations for robust deployment
	paths := []string{
		filepath.Join(cwd, "backend", "static", filename),
		filepath.Join(cwd, "static", filename),
		filename,
	}

	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			log.Printf("[DEBUG] Serving %s from: %s", filename, p)
			return p
		}
	}
	return ""
}

func main() {
	cwd, _ := os.Getwd()
	log.Printf("[INFO] Current Working Directory: %s", cwd)
	
	// Pre-start sanity check
	if path := findStaticFile("index.html"); path == "" {
		log.Println("[CRITICAL] index.html NOT FOUND during startup check")
	} else {
		log.Printf("[INFO] index.html found during startup at: %s", path)
	}

	// Initialize Database
	db.InitDB()
	defer db.DB.Close()

	if mode := os.Getenv("GIN_MODE"); mode != "" {
		gin.SetMode(mode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	
	// CORS first
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		AllowCredentials: false,
	}))

	// Logging
	r.Use(func(c *gin.Context) {
		log.Printf("[REQ] %s %s", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ready", "engine": "go-hardened"})
		})
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
		api.POST("/auth/logout", handlers.Logout)
		api.GET("/records/public", middleware.OptionalAuthMiddleware(), handlers.GetPublicRecords)
		api.GET("/users/:id/profile", middleware.OptionalAuthMiddleware(), handlers.GetUserProfile)

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/records", handlers.GetRecords)
			protected.POST("/records/upload", handlers.UploadRecord)
			protected.GET("/user/profile", handlers.GetUserInfo)
			protected.PUT("/user/profile", handlers.UpdateProfile)
protected.PUT("/user/password", handlers.ChangePassword)
protected.POST("/records/:id/toggle-public", handlers.TogglePublic)
protected.POST("/record/:id/reaction", handlers.ToggleReaction)
protected.POST("/records/:id/reaction", handlers.ToggleReaction)
protected.GET("/records/:id/comments", handlers.GetComments)
protected.POST("/records/:id/comments", handlers.AddComment)
protected.PUT("/comments/:id", handlers.UpdateComment)
protected.DELETE("/comments/:id", handlers.DeleteComment)
protected.POST("/comment/:id/reaction", handlers.ToggleReaction)
protected.POST("/users/:id/follow", handlers.ToggleFollow)
		}
	}

	// Serve assets locally if they exist
	r.Static("/assets", "./backend/static/assets")
	r.Static("/api/uploads", "./uploads")
	
	// Catch-all for SPA
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(404, gin.H{"error": "API route not found"})
			return
		}

		// Try files directly (for favicon, icons, etc.)
		if path != "/" {
			if fullPath := findStaticFile(path); fullPath != "" {
				c.File(fullPath)
				return
			}
		}

		// Fallback to index.html
		if indexPath := findStaticFile("index.html"); indexPath != "" {
			c.File(indexPath)
		} else {
			c.String(404, "ERROR: Frontend files missing. Check logs.")
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("[START] Running on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}







