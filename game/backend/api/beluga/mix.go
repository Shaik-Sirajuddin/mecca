package beluga

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MixBody struct {
	Level uint `json:"level" binding:"required"`
}

func Mix(c *gin.Context) {
	userId := c.GetUint("userId")

	var body MixBody
	var tx *gorm.DB

	defer func() {
		if r := recover(); r != nil && tx != nil {
			tx.Rollback()
		}
	}()

	if err := c.ShouldBindJSON(&body); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Missing or invalid parametes",
		})
		return
	}

	if body.Level >= 10 || body.Level <= 0 {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Invalid level value",
		})
		return
	}

	var holding models.BelugaHolding

	tx = db.DB.Begin()
	if result := tx.Where("user_id = ? and beluga_id = ?", userId, body.Level).First(&holding).Error; result != nil {
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}

	if holding.Quantity < 4 {
		tx.Rollback()
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Not enough quantity to mix",
		})
		return
	}

	mixSuccess := utils.GetRandomBinary()
	holding.Quantity -= 4

	if mixSuccess {

		//set current level balance - 4
		if result := tx.Save(&holding).Error; result != nil {
			tx.Rollback()
			utils.ResIntenalError(c)
			return
		}

		//add next level balance by 1
		if result := tx.Model(&models.BelugaHolding{}).
			Where("user_id = ? and beluga_id = ?", userId, body.Level+1).
			UpdateColumn("quantity", gorm.Expr("quantity + ?", 1)).Error; result != nil {
			tx.Rollback()
			utils.ResIntenalError(c)
			return
		}

		tx.Commit()
		c.IndentedJSON(http.StatusOK, gin.H{
			"result":  true,
			"message": "Mix Done",
		})
		return
	}

	holding.Quantity++

	//decrease quantity by 3 ( -4 + 1)  as failed mix
	if result := tx.Save(&holding).Error; result != nil {
		tx.Rollback()
		utils.ResIntenalError(c)
		return
	}

	tx.Commit()
	c.IndentedJSON(http.StatusOK, gin.H{
		"result":  false,
		"message": "Mix Done",
	})
}
