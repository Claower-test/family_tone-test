package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "./family_tone.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	tables := []string{"users", "records", "likes", "comments", "follows"}
	fmt.Println("Checking tables...")
	for _, table := range tables {
		var name string
		err := db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name=?", table).Scan(&name)
		if err == sql.ErrNoRows {
			fmt.Printf("Table %s: MISSING\n", table)
		} else if err != nil {
			fmt.Printf("Table %s: ERROR (%v)\n", table, err)
		} else {
			fmt.Printf("Table %s: OK\n", table)
		}
	}
}
