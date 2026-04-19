package api

import (
	"log"
	"net/http"
	"strings"

	"github.com/family_tone/internal/handlers"
	"github.com/family_tone/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures the entire API router
func SetupRouter() *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	
	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		AllowCredentials: false,
	}))

	// Request Logging
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

		// Auth
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/logout", handlers.Logout)
		}

		// Public & Optional Auth
		api.GET("/records/public", middleware.OptionalAuthMiddleware(), handlers.GetPublicRecords)
		api.GET("/users/:id/profile", middleware.OptionalAuthMiddleware(), handlers.GetUserProfile)

		// Protected Routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Records
			protected.GET("/records", handlers.GetRecords)
			protected.POST("/records/upload", handlers.UploadRecord)
			protected.POST("/records/:id/toggle-public", handlers.TogglePublic)
			protected.POST("/records/:id/reaction", handlers.ToggleReaction)

			// Profile
			protected.GET("/user/profile", handlers.GetUserInfo)
			protected.PUT("/user/profile", handlers.UpdateProfile)
			protected.PUT("/user/password", handlers.ChangePassword)

			// Comments
			protected.GET("/records/:id/comments", handlers.GetComments)
			protected.POST("/records/:id/comments", handlers.AddComment)
			protected.PUT("/comments/:id", handlers.UpdateComment)
			protected.DELETE("/comments/:id", handlers.DeleteComment)
			protected.POST("/comment/:id/reaction", handlers.ToggleReaction)

			// Social
			protected.POST("/users/:id/follow", handlers.ToggleFollow)
		}
	}

	// Static Assets
	r.Static("/assets", "./backend/static/assets")
	r.Static("/api/uploads", "./uploads")

	// SPA Catch-all handled in main.go to avoid dependency issues with findStaticFile
	return r
}
