package admin

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"beluga/session"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func Stats(c *gin.Context) {
	dau := session.GetTodayLoginCount(c.Request.Context())

	var userCount int64

	if result := db.DB.Model(&models.User{}).Count(&userCount).Error; result != nil {
		println(result.Error())
		utils.ResIntenalError(c)
		return
	}

	type HodingsValue struct {
		Value decimal.Decimal `json:"total_holdings_value"`
		Coins decimal.Decimal `json:"total_coins"`
	}

	holdingsValue := HodingsValue{}

	if err := db.DB.Raw(
		`SELECT COALESCE(SUM(bv.value * bh.quantity), 0) AS total_holdings_value
		 FROM beluga_holdings bh
		 JOIN beluga_variants bv ON bh.beluga_id = bv.id;
       `).Scan(&holdingsValue.Value).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	if err := db.DB.Raw(
		`SELECT COALESCE(SUM(coins), 0) AS total_coins FROM users;`).
		Scan(&holdingsValue.Coins).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	totalWithdrawn := 0

	if err := db.DB.Raw(
		`SELECT COALESCE(SUM(amount), 0) AS total_withdrawn FROM withdrawls where status = 1;`).
		Scan(&totalWithdrawn).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "Data Fetched",
		"data": gin.H{
			"dau":              dau,
			"totalUsers":       userCount,
			"holdingsValue":    holdingsValue.Value.String(),
			"totalCoins":       holdingsValue.Coins.String(),
			"exportInProgress": ExportInProgress,
			"totalWithdrawn":   totalWithdrawn,
		},
	})
}
