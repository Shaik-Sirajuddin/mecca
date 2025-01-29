package admin

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

type HoldingResult struct {
	UserId   uint
	Level    string
	Value    decimal.Decimal
	Quantity uint
}

func UserHoliding(c *gin.Context) {
	userId, _ := strconv.Atoi(c.DefaultQuery("userId", "1"))
	//no need to check userId is not zero as
	var user models.User
	var belugaHoldings []HoldingResult

	result := db.DB.First(&user, userId)

	if result.Error != nil {
		utils.ResIntenalError(c)
		return
	}

	result = db.DB.Model(&models.BelugaHolding{}).
		Select("beluga_holdings.quantity,beluga_variants.level,beluga_variants.value").
		Joins("join beluga_variants on beluga_variants.id = beluga_holdings.beluga_id").
		Where("beluga_holdings.user_id = ?", userId).
		Find(&belugaHoldings)

	if result.Error != nil {
		utils.ResIntenalError(c)
		return
	}

	var holdings []gin.H

	for _, holding := range belugaHoldings {
		holdings = append(holdings, gin.H{
			"level":    holding.Level,
			"quantity": holding.Quantity,
			"value":    holding.Value,
		})
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "User Fetched",
		"data": gin.H{
			"id":       user.ID,
			"holdings": holdings,
		},
	})
}
