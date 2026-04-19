package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/family_tone/internal/api"
	"github.com/family_tone/internal/db"
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

	// Setup Router
	r := api.SetupRouter()

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
