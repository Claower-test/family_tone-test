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

func main() {
	cwd, _ := os.Getwd()
	log.Printf("[INIT] Working Directory: %s", cwd)

	// Initialize Database
	db.InitDB()
	defer db.DB.Close()

	if mode := os.Getenv("GIN_MODE"); mode != "" {
		gin.SetMode(mode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	
	// 1. Diagnostic Logging
	r.Use(func(c *gin.Context) {
		log.Printf("[REQUEST] %s %s", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	// 2. Ultra-flexible CORS
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 3. Explicit OPTIONS catch-all
	r.OPTIONS("/*any", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	// 4. API Routes (Flat structure to avoid group issues)
	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "engine": "family-tone-go"})
	})

	r.POST("/api/auth/register", handlers.Register)
	r.POST("/api/auth/login", handlers.Login)
	r.POST("/api/auth/logout", handlers.Logout)

	r.GET("/api/records/public", middleware.OptionalAuthMiddleware(), handlers.GetPublicRecords)
	r.GET("/api/records/:id/comments", middleware.OptionalAuthMiddleware(), handlers.GetComments)
	r.GET("/api/users/:id/profile", middleware.OptionalAuthMiddleware(), handlers.GetUserProfile)

	// Protected
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/records", handlers.GetRecords)
		protected.POST("/records/upload", handlers.UploadRecord)
		protected.POST("/records/:id/toggle-public", handlers.TogglePublic)
		protected.GET("/user/profile", handlers.GetUserInfo)
		protected.PUT("/user/profile", handlers.UpdateProfile)
		protected.PUT("/user/password", handlers.ChangePassword)
		protected.POST("/:type/:id/reaction", handlers.ToggleReaction)
		protected.POST("/records/:id/comments", handlers.AddComment)
		protected.PUT("/comments/:id", handlers.UpdateComment)
		protected.DELETE("/comments/:id", handlers.DeleteComment)
		protected.POST("/users/:user_id/follow", handlers.ToggleFollow)
	}

	// 5. Static Files
	r.Static("/api/uploads", "./backend/uploads")
	r.Static("/assets", "./backend/static/assets")
	
	// SPA Fallback
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(404, gin.H{"error": "api route not found"})
			return
		}
		
		// Serve static file if exists
		filePath := "./backend/static" + path
		if _, err := os.Stat(filePath); err == nil && path != "/" {
			c.File(filePath)
			return
		}
		c.File("./backend/static/index.html")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("[START] Server listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
