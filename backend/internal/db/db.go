package db

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB() {
	var err error
	dbPath := "./family_tone.db"
	
	// Create data directory if it doesn't exist
	if _, err := os.Stat("./data"); os.IsNotExist(err) {
		os.Mkdir("./data", 0755)
	}

	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	createTables()
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			avatar_url TEXT DEFAULT '',
			bio TEXT DEFAULT '',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS records (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			title TEXT NOT NULL,
			file_path TEXT,
			duration INTEGER,
			is_public BOOLEAN DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id)
		)`,
		`CREATE TABLE IF NOT EXISTS follows (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			follower_id INTEGER NOT NULL,
			following_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(follower_id) REFERENCES users(id),
			FOREIGN KEY(following_id) REFERENCES users(id),
			UNIQUE(follower_id, following_id)
		)`,
		`CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			record_id INTEGER NOT NULL,
			parent_id INTEGER DEFAULT NULL,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(record_id) REFERENCES records(id),
			FOREIGN KEY(parent_id) REFERENCES comments(id)
		)`,
		`CREATE TABLE IF NOT EXISTS record_reactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			record_id INTEGER NOT NULL,
			type INTEGER NOT NULL, -- 1 for heart, -1 for broken heart
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(record_id) REFERENCES records(id),
			UNIQUE(user_id, record_id)
		)`,
		`CREATE TABLE IF NOT EXISTS comment_reactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			comment_id INTEGER NOT NULL,
			type INTEGER NOT NULL, -- 1 for heart, -1 for broken heart
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(comment_id) REFERENCES comments(id),
			UNIQUE(user_id, comment_id)
		)`,
	}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Printf("Execution error on query: %s\nError: %v", query, err)
		}
	}

	// Manual migrations for existing columns
	_, _ = DB.Exec("ALTER TABLE records ADD COLUMN is_public BOOLEAN DEFAULT 0;")
	_, _ = DB.Exec("ALTER TABLE comments ADD COLUMN parent_id INTEGER DEFAULT NULL;")
	_, _ = DB.Exec("ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT '';")
	_, _ = DB.Exec("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';")
}

func GenerateUniqueID() string {
	return fmt.Sprintf("rec_%d_%d", time.Now().UnixNano(), rand.Intn(1000))
}


