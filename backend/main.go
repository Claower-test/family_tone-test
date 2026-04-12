package main

import (
	"log"
	"net/http"
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
	paths := []string{
		filepath.Join(cwd, "backend", "static", filename),
		filepath.Join(cwd, "static", filename),
		filepath.Join(cwd, "frontend", "dist", filename),
		filename,
	}

	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			log.Printf("[STATIC] Found %s at: %s", filename, p)
			return p
		}
	}
	return ""
}

func main() {
	log.Printf("[INIT] Root Directory: %s", func() string { r, _ := os.Getwd(); return r }())

	// Initialize Database
	db.InitDB()
	defer db.DB.Close()

	if mode := os.Getenv("GIN_MODE"); mode != "" {
		gin.SetMode(mode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	
	// 1. TOP PRIORITY: CORS middleware
	// This must be the very first middleware to handle OPTIONS correctly
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With", "X-Engine"},
		ExposeHeaders:    []string{"Content-Length", "X-Engine"},
		AllowCredentials: true,
	}))

	// Diagnostic Logging
	r.Use(func(c *gin.Context) {
		c.Header("X-Backend", "Family-Tone-Ultimate")
		log.Printf("[REQ] %s %s", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	// 2. Explicit OPTIONS catch-all
	r.OPTIONS("/*any", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	// 3. API Routes
	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ready", "engine": "go-ultimate"})
		})

		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
		api.POST("/auth/logout", handlers.Logout)

		api.GET("/records/public", middleware.OptionalAuthMiddleware(), handlers.GetPublicRecords)
		api.GET("/users/:id/profile", middleware.OptionalAuthMiddleware(), handlers.GetUserProfile)

		// Protected
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/records", handlers.GetRecords)
			protected.POST("/records/upload", handlers.UploadRecord)
			protected.GET("/user/profile", handlers.GetUserInfo)
		}
	}

	// 4. Static Files and SPA Fallback
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		
		// Never serve SPA for API paths
		if strings.HasPrefix(path, "/api") {
			c.JSON(404, gin.H{"error": "API route not found"})
			return
		}

		// Try to serve static assets first (e.g. /assets/index.js)
		if path != "/" {
			staticPath := findStaticFile(path)
			if staticPath != "" {
				c.File(staticPath)
				return
			}
		}

		// Fallback to index.html for all SPA routes
		indexPath := findStaticFile("index.html")
		if indexPath != "" {
			c.File(indexPath)
		} else {
			log.Println("[ERROR] index.html NOT FOUND ANYWHERE")
			c.String(404, "Frontend files not found. Please check build logs.")
		}
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
