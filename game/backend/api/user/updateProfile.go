package user

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UpdateBody struct {
	Name          string `json:"name"`
	WalletAddress string `json:"wallet_address"`
}

func UpdateProfile(c *gin.Context) {

	var body UpdateBody
	err := c.ShouldBindJSON(&body)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Request Body",
		})
		return
	}

	userId := c.GetUint("userId")

	result := db.DB.Model(&models.User{}).Where("id = ?", userId).Updates(map[string]interface{}{
		"name":           body.Name,
		"wallet_address": body.WalletAddress,
	})

	if result.Error != nil {
		println(result.Error.Error())
		utils.ResIntenalError(c)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "User data updated",
	})
}
