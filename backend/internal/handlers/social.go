package handlers

import (
	"database/sql"
	"log"
	"strconv"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/models"
	"github.com/family_tone/internal/utils"
	"github.com/gin-gonic/gin"
)

// ToggleReaction handles likes (1) and dislikes (-1) for both records and comments
func ToggleReaction(c *gin.Context) {
	userID, _ := c.Get("user_id")
	targetType := c.Param("type") // "record" or "comment"
	targetID := c.Param("id")

	var req struct {
		Type int `json:"type" binding:"required"` // 1 for heart, -1 for broken heart
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Reaction type is required")
		return
	}

	tableName := "record_reactions"
	idColumn := "record_id"
	if targetType == "comment" {
		tableName = "comment_reactions"
		idColumn = "comment_id"
	}

	// Check current reaction
	var currentType int
	err := db.DB.QueryRow("SELECT type FROM "+tableName+" WHERE user_id = ? AND "+idColumn+" = ?", userID, targetID).Scan(&currentType)
	
	if err == sql.ErrNoRows {
		// No reaction yet, insert new
		_, err = db.DB.Exec("INSERT INTO "+tableName+" (user_id, "+idColumn+", type) VALUES (?, ?, ?)", userID, targetID, req.Type)
	} else if err == nil {
		if currentType == req.Type {
			// Same reaction, remove it (toggle off)
			_, err = db.DB.Exec("DELETE FROM "+tableName+" WHERE user_id = ? AND "+idColumn+" = ?", userID, targetID)
		} else {
			// Different reaction, update it
			_, err = db.DB.Exec("UPDATE "+tableName+" SET type = ? WHERE user_id = ? AND "+idColumn+" = ?", req.Type, userID, targetID)
		}
	}

	if err != nil {
		log.Printf("Reaction error: %v", err)
		utils.InternalError(c, "Failed to toggle reaction")
		return
	}

	utils.Success(c, gin.H{"message": "Reaction updated"})
}

func AddComment(c *gin.Context) {
	userID, _ := c.Get("user_id")
	recordID := c.Param("id")

	var req struct {
		Content  string `json:"content" binding:"required"`
		ParentID *int   `json:"parent_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Content is required")
		return
	}

	_, err := db.DB.Exec("INSERT INTO comments (user_id, record_id, parent_id, content) VALUES (?, ?, ?, ?)", userID, recordID, req.ParentID, req.Content)
	if err != nil {
		utils.InternalError(c, "Failed to add comment")
		return
	}

	utils.Created(c, gin.H{"message": "Comment added"})
}

func UpdateComment(c *gin.Context) {
	userID, _ := c.Get("user_id")
	commentID := c.Param("id")

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Content is required")
		return
	}

	// Verify ownership
	var ownerID int
	err := db.DB.QueryRow("SELECT user_id FROM comments WHERE id = ?", commentID).Scan(&ownerID)
	if err != nil {
		utils.NotFound(c, "Comment not found")
		return
	}

	if ownerID != userID.(int) {
		utils.Forbidden(c, "You can only edit your own comments")
		return
	}

	_, err = db.DB.Exec("UPDATE comments SET content = ? WHERE id = ?", req.Content, commentID)
	if err != nil {
		utils.InternalError(c, "Failed to update comment")
		return
	}

	utils.Success(c, gin.H{"message": "Comment updated"})
}

func DeleteComment(c *gin.Context) {
	userID, _ := c.Get("user_id")
	commentID := c.Param("id")

	// Verify ownership
	var ownerID int
	err := db.DB.QueryRow("SELECT user_id FROM comments WHERE id = ?", commentID).Scan(&ownerID)
	if err != nil {
		utils.NotFound(c, "Comment not found")
		return
	}

	if ownerID != userID.(int) {
		utils.Forbidden(c, "You can only delete your own comments")
		return
	}

	// Check if has replies
	var hasReplies bool
	err = db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM comments WHERE parent_id = ?)", commentID).Scan(&hasReplies)

	if hasReplies {
		// Mark as deleted instead of removing
		_, err = db.DB.Exec("UPDATE comments SET content = '[Комментарий удален]', user_id = 0 WHERE id = ?", commentID)
	} else {
		// Safe to remove
		_, err = db.DB.Exec("DELETE FROM comments WHERE id = ?", commentID)
	}

	if err != nil {
		utils.InternalError(c, "Failed to delete comment")
		return
	}

	utils.Success(c, gin.H{"message": "Comment deleted"})
}

func GetComments(c *gin.Context) {
	recordID := c.Param("id")
	currentUserID, _ := c.Get("user_id")

	rows, err := db.DB.Query(`
		SELECT 
			c.id, c.user_id, c.record_id, c.parent_id, u.name as user_name, u.avatar_url as user_avatar, c.content, c.created_at,
			(SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND type = 1) as hearts_count,
			(SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND type = -1) as broken_hearts_count,
			COALESCE((SELECT type FROM comment_reactions WHERE comment_id = c.id AND user_id = ?), 0) as user_reaction
		FROM comments c 
		LEFT JOIN users u ON c.user_id = u.id 
		WHERE c.record_id = ? 
		ORDER BY c.created_at ASC`, 
	currentUserID, recordID)
	
	if err != nil {
		utils.InternalError(c, "Failed to fetch comments")
		return
	}
	defer rows.Close()

	allComments := []models.Comment{}
	for rows.Next() {
		var com models.Comment
		var parentID sql.NullInt64
		var userName sql.NullString
		var userAvatar sql.NullString
		if err := rows.Scan(
			&com.ID, &com.UserID, &com.RecordID, &parentID, &userName, &userAvatar, &com.Content, &com.CreatedAt,
			&com.HeartsCount, &com.BrokenHeartsCount, &com.UserReaction,
		); err != nil {
			log.Printf("Error scanning comment: %v", err)
			continue
		}
		if parentID.Valid {
			pid := int(parentID.Int64)
			com.ParentID = &pid
		}
		if userName.Valid {
			com.UserName = userName.String
		} else {
			com.UserName = "Пользователь"
		}
		if userAvatar.Valid {
			com.UserAvatar = userAvatar.String
		}
		allComments = append(allComments, com)
	}

	// Build tree structure
	commentMap := make(map[int]*models.Comment)
	tree := []models.Comment{}

	for i := range allComments {
		commentMap[allComments[i].ID] = &allComments[i]
	}

	for _, com := range allComments {
		if com.ParentID == nil {
			tree = append(tree, com)
		} else {
			if parent, ok := commentMap[*com.ParentID]; ok {
				parent.Replies = append(parent.Replies, com)
			}
		}
	}

	utils.Success(c, tree)
}

func ToggleFollow(c *gin.Context) {
	followerID, _ := c.Get("user_id")
	followingIDStr := c.Param("user_id")
	followingID, _ := strconv.Atoi(followingIDStr)

	if followerID == followingID {
		utils.BadRequest(c, "You cannot follow yourself")
		return
	}

	var exists bool
	err := db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?)", followerID, followingID).Scan(&exists)
	if err != nil {
		utils.InternalError(c, "Database error")
		return
	}

	if exists {
		_, err = db.DB.Exec("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", followerID, followingID)
	} else {
		_, err = db.DB.Exec("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", followerID, followingID)
	}

	if err != nil {
		utils.InternalError(c, "Failed to toggle follow")
		return
	}

	utils.Success(c, gin.H{"following": !exists})
}
