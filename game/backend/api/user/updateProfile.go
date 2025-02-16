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
	ProfileId     uint   `json:"profile_id"`
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
	
	updateData := make(map[string]interface{})

	if body.Name != "" {
		updateData["name"] = body.Name
	}
	if body.WalletAddress != "" {
		updateData["wallet_address"] = body.WalletAddress
	}
	if body.ProfileId != 0 {
		updateData["profile_id"] = body.ProfileId
	}

	if len(updateData) > 0 {
		result := db.DB.Model(&models.User{}).Where("id = ?", userId).Updates(updateData)

		if result.Error != nil {
			println(result.Error.Error())
			utils.ResIntenalError(c)
			return
		}
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "User data updated",
	})
}
