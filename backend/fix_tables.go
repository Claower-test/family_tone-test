package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "./family_tone.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	queries := []string{
		`CREATE TABLE IF NOT EXISTS likes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			record_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(record_id) REFERENCES records(id),
			UNIQUE(user_id, record_id)
		)`,
		`CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			record_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(record_id) REFERENCES records(id)
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
	}

	for _, q := range queries {
		_, err := db.Exec(q)
		if err != nil {
			log.Printf("Failed to create table: %v", err)
		} else {
			log.Printf("Table created/verified successfully")
		}
	}
}
