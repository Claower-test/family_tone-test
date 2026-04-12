package middleware

import (
	"net/http"
	"strings"

	"github.com/family_tone/internal/utils"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := parseAuthHeader(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}
		c.Set("user_id", userID)
		c.Next()
	}
}

func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := parseAuthHeader(c)
		if err == nil {
			c.Set("user_id", userID)
		}
		c.Next()
	}
}

func parseAuthHeader(c *gin.Context) (int, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return 0, http.ErrNoLocation // Placeholder for 'missing'
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if !(len(parts) == 2 && parts[0] == "Bearer") {
		return 0, http.ErrNoLocation
	}

	claims, err := utils.ValidateToken(parts[1])
	if err != nil {
		return 0, err
	}

	return claims.UserID, nil
}
