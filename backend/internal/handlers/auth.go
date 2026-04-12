package handlers

import (
	"net/http"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/models"
	"github.com/family_tone/internal/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	result, err := db.DB.Exec("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", req.Name, req.Email, string(hashedPassword))
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	id, _ := result.LastInsertId()
	token, err := utils.GenerateToken(int(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		User: models.User{
			ID:    int(id),
			Name:  req.Name,
			Email: req.Email,
		},
		Token: token,
	})
}

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	err := db.DB.QueryRow("SELECT id, name, email, password FROM users WHERE email = ?", req.Email).Scan(&user.ID, &user.Name, &user.Email, &user.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		User:  user,
		Token: token,
	})
}

func Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
