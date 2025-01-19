package game

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Claim(c *gin.Context) {
	userId := c.GetUint("userId")

	var tx *gorm.DB

	defer func() {
		if r := recover(); r != nil && tx != nil {
			tx.Rollback()
		}
	}()

	tx = db.DB.Begin()
	var gameRound models.GameRound
	result := tx.Model(&models.GameRound{}).Where("user_id = ? and claimed = 0", userId).First(&gameRound).Error

	if result != nil && result.Error() != "record not found" {
		utils.ResIntenalError(c)
		tx.Rollback()
		return
	}

	if gameRound.ID == 0 || gameRound.Taps != 60 {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "No eligible round to claim",
		})
		tx.Rollback()
		return
	}

	var probabilityList = []float64{
		36,
		22.5, 15, 10, 7, 5, 2, 1.5, 0.98, 0.02,
	}

	pickedBelugaLevel := utils.SelectRandomNumber(probabilityList)

	now := time.Now()
	gameRound.Claimed = true
	gameRound.EndTime = &now
	gameRound.PickedBeluga = &pickedBelugaLevel

	if result = tx.Save(&gameRound).Error; result != nil {
		utils.ResIntenalError(c)
		tx.Rollback()
		return
	}

	if gameRound.IsAdditional {
		if result = tx.Model(&models.User{}).
			Where("id = ?", userId).
			UpdateColumn("additional_played", gorm.Expr("additional_played + ?", 1)).Error; result != nil {
			utils.ResIntenalError(c)
			tx.Rollback()
			return
		}
	}

	if result = tx.Model(&models.BelugaHolding{}).
		Where("user_id = ? and beluga_id = ?", userId, pickedBelugaLevel).
		UpdateColumn("quantity", gorm.Expr("quantity + ?", 1)).Error; result != nil {
		utils.ResIntenalError(c)
		tx.Rollback()
		return
	}

	var referral models.Referrals

	if err := tx.Where("referee_id=?", userId).First(&referral).Error; err != nil {
		if err.Error() != "record not found" {
			utils.ResIntenalError(c)
			tx.Rollback()
			return
		}
	}
	if referral.ID != 0 && !referral.Success {
		if err := tx.Model(&referral).Update("success", true).Error; err != nil {
			utils.ResIntenalError(c)
			tx.Rollback()
			return
		}
	}

	tx.Commit()
	c.IndentedJSON(http.StatusOK, gin.H{
		"result":  pickedBelugaLevel,
		"message": "Claim success",
	})
}
