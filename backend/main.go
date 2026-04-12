package main

import (
	"log"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/handlers"
	"github.com/family_tone/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Database
	db.InitDB()
	defer db.DB.Close()

	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API Routes
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
		
		// Static files
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
			protected.POST("/:type/:id/reaction", handlers.ToggleReaction) // type: record or comment
			protected.POST("/records/:id/comments", handlers.AddComment)
			protected.PUT("/comments/:id", handlers.UpdateComment)
			protected.DELETE("/comments/:id", handlers.DeleteComment)
			protected.POST("/users/:user_id/follow", handlers.ToggleFollow)
		}
	}

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
