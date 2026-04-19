package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/models"
	"github.com/family_tone/internal/utils"
	"github.com/gin-gonic/gin"
)

func GetRecords(c *gin.Context) {
	userID, _ := c.Get("user_id")

	rows, err := db.DB.Query(`
		SELECT 
			r.id, r.user_id, r.title, r.file_path, r.duration, r.is_public, r.created_at,
			(SELECT COUNT(*) FROM record_reactions WHERE record_id = r.id AND type = 1) as hearts_count,
			(SELECT COUNT(*) FROM record_reactions WHERE record_id = r.id AND type = -1) as broken_hearts_count,
			(SELECT COUNT(*) FROM comments WHERE record_id = r.id) as comments_count,
			COALESCE((SELECT type FROM record_reactions WHERE record_id = r.id AND user_id = ?), 0) as user_reaction
		FROM records r 
		WHERE r.user_id = ? 
		ORDER BY r.created_at DESC`, 
		userID, userID)
	
	if err != nil {
		utils.InternalError(c, "Failed to fetch records")
		return
	}
	defer rows.Close()

	records := []models.Record{}
	for rows.Next() {
		var r models.Record
		if err := rows.Scan(
			&r.ID, &r.UserID, &r.Title, &r.FilePath, &r.Duration, &r.IsPublic, &r.CreatedAt,
			&r.HeartsCount, &r.BrokenHeartsCount, &r.CommentsCount, &r.UserReaction,
		); err != nil {
			log.Printf("Error scanning record: %v", err)
			continue
		}
		records = append(records, r)
	}

	utils.Success(c, records)
}

func CreateRecord(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.Record
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	result, err := db.DB.Exec("INSERT INTO records (user_id, title, file_path, duration) VALUES (?, ?, ?, ?)", userID, req.Title, req.FilePath, req.Duration)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create record"})
		return
	}

	id, _ := result.LastInsertId()
	req.ID = int(id)
	req.UserID = userID.(int)

	c.JSON(201, req)
}

func UploadRecord(c *gin.Context) {
	userID, _ := c.Get("user_id")
	title := c.PostForm("title")
	duration, _ := strconv.ParseFloat(c.PostForm("duration"), 64)
	isPublicStr := c.PostForm("is_public")
	isPublic := isPublicStr == "true" || isPublicStr == "1"

	file, err := c.FormFile("audio")
	if err != nil {
		utils.BadRequest(c, "Audio file is required")
		return
	}

	// Create uploads directory if it doesn't exist
	if _, err := os.Stat("./uploads"); os.IsNotExist(err) {
		os.MkdirAll("./uploads", 0755)
	}

	filename := db.GenerateUniqueID() + filepath.Ext(file.Filename)
	savePath := filepath.Join("uploads", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		log.Printf("Upload error: %v", err)
		utils.InternalError(c, "Failed to save file")
		return
	}

	filePath := "/api/uploads/" + filename
	_, err = db.DB.Exec("INSERT INTO records (user_id, title, file_path, duration, is_public) VALUES (?, ?, ?, ?, ?)",
		userID, title, filePath, duration, isPublic)

	if err != nil {
		log.Printf("Insert error: %v", err)
		utils.InternalError(c, "Failed to save record info")
		return
	}

	utils.Created(c, gin.H{"message": "Record uploaded successfully", "file_path": filePath})
}

func TogglePublic(c *gin.Context) {
	userID, _ := c.Get("user_id")
	recordID := c.Param("id")

	var currentStatus bool
	err := db.DB.QueryRow("SELECT is_public FROM records WHERE id = ? AND user_id = ?", recordID, userID).Scan(&currentStatus)
	if err != nil {
		utils.NotFound(c, "Record not found")
		return
	}

	newStatus := !currentStatus
	_, err = db.DB.Exec("UPDATE records SET is_public = ? WHERE id = ?", newStatus, recordID)
	if err != nil {
		utils.InternalError(c, "Failed to update record")
		return
	}

	utils.Success(c, gin.H{"is_public": newStatus})
}

func GetPublicRecords(c *gin.Context) {
	currentUserID, _ := c.Get("user_id")

	query := `
		SELECT 
			r.id, r.user_id, r.title, r.file_path, r.duration, r.is_public, r.created_at,
			u.name as author_name, u.avatar_url as author_avatar,
			(SELECT COUNT(*) FROM record_reactions WHERE record_id = r.id AND type = 1) as hearts_count,
			(SELECT COUNT(*) FROM record_reactions WHERE record_id = r.id AND type = -1) as broken_hearts_count,
			(SELECT COUNT(*) FROM comments WHERE record_id = r.id) as comments_count,
			COALESCE((SELECT type FROM record_reactions WHERE record_id = r.id AND user_id = ?), 0) as user_reaction,
			(SELECT EXISTS(SELECT 1 FROM follows WHERE following_id = r.user_id AND follower_id = ?)) as is_following
		FROM records r
		JOIN users u ON r.user_id = u.id
		WHERE r.is_public = 1
		ORDER BY r.created_at DESC`

	rows, err := db.DB.Query(query, currentUserID, currentUserID)
	if err != nil {
		log.Printf("Query error in GetPublicRecords: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch public records"})
		return
	}
	defer rows.Close()

	records := []models.Record{}
	for rows.Next() {
		var r models.Record
		if err := rows.Scan(
			&r.ID, &r.UserID, &r.Title, &r.FilePath, &r.Duration, &r.IsPublic, &r.CreatedAt,
			&r.AuthorName, &r.AuthorAvatar, &r.HeartsCount, &r.BrokenHeartsCount, &r.CommentsCount, &r.UserReaction, &r.IsFollowing,
		); err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}
		records = append(records, r)
	}

	c.JSON(http.StatusOK, records)
}
