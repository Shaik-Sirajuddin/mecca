package beluga

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ConvertBody struct {
	Level    uint `json:"level" binding:"required"`
	Quantity uint `json:"quantity" binding:"required"`
}

func Convert(c *gin.Context) {
	userId := c.GetUint("userId")

	var body ConvertBody

	var tx *gorm.DB

	defer func() {
		if r := recover(); r != nil && tx != nil {
			tx.Rollback()
		}
	}()

	if err := c.ShouldBindJSON(&body); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Missing or invalid parameters",
		})
		return
	}

	if body.Level <= 0 || body.Level > 10 {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Level",
		})
		return
	}

	tx = db.DB.Begin()

	type HoldingData struct {
		BelugaId uint
		Quantity uint
		Value    float64
	}
	var holding HoldingData

	if result := tx.Model(&models.BelugaHolding{}).Select("beluga_holdings.quantity,beluga_holdings.beluga_id,bv.value").Joins("join beluga_variants as bv on bv.id = beluga_holdings.beluga_id").Where("user_id = ? and beluga_id = ?", userId, body.Level).First(&holding).Error; result != nil {
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}

	if holding.Quantity < body.Quantity {
		tx.Rollback()
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Not enough quantity to convert",
		})
		return
	}

	//has enough quantity increase user coin balance

	if result := tx.Model(&models.BelugaHolding{}).
		Where("user_id = ? and beluga_id = ?", userId, body.Level).
		UpdateColumn("quantity", gorm.Expr("quantity - ?", body.Quantity)).Error; result != nil {
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}

	var coinValue = holding.Value * float64(body.Quantity)
	if result := tx.Model(&models.User{}).
		Where("id = ?", userId).
		UpdateColumn("coins", gorm.Expr("coins + ?", fmt.Sprint(coinValue))).Error; result != nil {
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}
	tx.Commit()
	c.IndentedJSON(http.StatusOK, gin.H{
		"value":   fmt.Sprint(coinValue),
		"message": "Convert success",
	})
}
