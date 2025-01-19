package admin

import (
	"beluga/session"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DAU(c *gin.Context) {
	userCount := session.GetTodayLoginCount(c.Request.Context())

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "Data Fetched",
		"data": gin.H{
			"userCount": userCount,
		},
	})
}
