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
		utils.BadRequest(c, err.Error())
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalError(c, "Failed to hash password")
		return
	}

	result, err := db.DB.Exec("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", req.Name, req.Email, string(hashedPassword))
	if err != nil {
		utils.Error(c, http.StatusConflict, "User with this email already exists")
		return
	}

	id, _ := result.LastInsertId()
	token, err := utils.GenerateToken(int(id))
	if err != nil {
		utils.InternalError(c, "Failed to generate token")
		return
	}

	utils.Created(c, models.AuthResponse{
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
		utils.BadRequest(c, err.Error())
		return
	}

	var user models.User
	err := db.DB.QueryRow("SELECT id, name, email, password FROM users WHERE email = ?", req.Email).Scan(&user.ID, &user.Name, &user.Email, &user.Password)
	if err != nil {
		utils.Unauthorized(c, "Invalid email or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.Unauthorized(c, "Invalid email or password")
		return
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		utils.InternalError(c, "Failed to generate token")
		return
	}

	utils.Success(c, models.AuthResponse{
		User:  user,
		Token: token,
	})
}

func Logout(c *gin.Context) {
	utils.Success(c, gin.H{"message": "Logged out successfully"})
}
