package middleware

import (
	"beluga/api/utils"
	"beluga/session"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func Admin(c *gin.Context) {
	auth := c.GetHeader("Authorization")

	if auth != "Gq8H9ZjUcL4LXxLd" {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		c.Abort()
		return
	}
	c.Next()
}
func AuthRequired(c *gin.Context) {
	sessionId := c.GetHeader("Authorization")

	userId, err := session.GetSession(c.Request.Context(), sessionId)

	if err == redis.Nil {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid Session",
		})
		c.Abort()
		return
	} else if err != nil {
		utils.ResIntenalError(c)
		return
	}
	c.Set("userId", userId)
	c.Next()
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
