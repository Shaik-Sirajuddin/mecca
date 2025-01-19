package game

import (
	userP "beluga/api/user"
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TapBody struct {
	Taps uint `json:"taps" binding:"required"`
}

func Tap(c *gin.Context) {
	userId := c.GetUint("userId")

	var tx *gorm.DB

	defer func() {
		if r := recover(); r != nil && tx != nil {
			tx.Rollback()
		}
	}()

	var body TapBody
	err := c.ShouldBindJSON(&body)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Missing required parametes in body",
		})
		return
	}
	if body.Taps > 60 {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Invalid property value",
		})
		return
	}

	tx = db.DB.Begin()

	var gameRound models.GameRound
	result := tx.Model(&models.GameRound{}).Where("user_id = ? and claimed = 0", userId).First(&gameRound).Error

	if result != nil && result.Error() != "record not found" {
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}
	if gameRound.UserId != 0 {
		//active session available increase tap
		//active unclaimed session available

		gameRound.Taps = body.Taps
		if result = tx.Save(&gameRound).Error; result != nil {
			tx.Rollback()
			utils.ResIntenalError(c)
			return
		}

		tx.Commit()
		c.IndentedJSON(http.StatusOK, gin.H{
			"message": "Updated",
		})
		return
	}

	waitTime := GetWaitTime(userId)

	//create session if wait time is 0

	if waitTime > 0 {
		tx.Rollback()
		c.IndentedJSON(http.StatusBadGateway, gin.H{
			"error": "Unable to update tap now",
		})
		return
	}

	var prevGamesCount int64
	if result = tx.Model(&models.GameRound{}).Where("user_id = ?", userId).Count(&prevGamesCount).Error; result != nil {
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}

	_, referralsCount := userP.GetReferralCount(userId)

	gameRound = models.GameRound{
		UserId:       userId,
		RoundIndex:   uint(prevGamesCount) + 1,
		Taps:         body.Taps,
		IsAdditional: referralsCount.UncliamedRounds > 0,
	}

	if result = tx.Save(&gameRound).Error; result != nil {
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}

	tx.Commit()

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "Updated",
	})
}
