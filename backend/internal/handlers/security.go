package handlers

import (
	"net/http"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func ChangePassword(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Get current password from DB
	var currentHashed string
	err := db.DB.QueryRow("SELECT password FROM users WHERE id = ?", userID).Scan(&currentHashed)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 2. Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(currentHashed), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid current password"})
		return
	}

	// 3. Hash new password
	newHashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	// 4. Update DB
	_, err = db.DB.Exec("UPDATE users SET password = ? WHERE id = ?", string(newHashed), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}
