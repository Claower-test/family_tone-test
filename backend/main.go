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
	// 1. Initialize DB first
	db.InitDB()
	defer db.DB.Close()

	r := gin.New()
	r.Use(gin.Recovery())
	
	// 2. Strong Diagnostic Header
	r.Use(func(c *gin.Context) {
		c.Header("X-Backend", "Family-Tone-Go")
		log.Printf("[REQ] %s %s", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	// 3. Permissive CORS for diagnostics
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		AllowCredentials: true,
	}))

	// 4. API Routes
	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ready", "engine": "go"})
		})

		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
		api.POST("/auth/logout", handlers.Logout)

		api.GET("/records/public", middleware.OptionalAuthMiddleware(), handlers.GetPublicRecords)
		api.GET("/users/:id/profile", middleware.OptionalAuthMiddleware(), handlers.GetUserProfile)

		// Authenticated
		auth := api.Group("/")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/records", handlers.GetRecords)
			auth.POST("/records/upload", handlers.UploadRecord)
			auth.GET("/user/profile", handlers.GetUserInfo)
		}
	}

	// 5. Serving Frontend
	r.Static("/assets", "./backend/static/assets")
	
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(404, gin.H{"error": "API route not found"})
			return
		}
		
		// Serve static files from backend/static
		if _, err := os.Stat("./backend/static" + path); err == nil && path != "/" {
			c.File("./backend/static" + path)
			return
		}
		c.File("./backend/static/index.html")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("[SERVER] Starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
