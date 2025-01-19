package admin

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UserCount(c *gin.Context) {
	tx := db.DB.Begin()

	var userCount int64

	if result := db.DB.Model(&models.User{}).Count(&userCount).Error; result != nil {
		println(result.Error())
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "Data Fetched",
		"data": gin.H{
			"userCount": userCount,
		},
	})
}
