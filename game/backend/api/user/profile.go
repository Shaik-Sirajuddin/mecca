package user

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

type HoldingResult struct {
	UserId   uint
	Level    string
	Value    decimal.Decimal
	Quantity uint
}

func Profile(c *gin.Context) {
	userId := c.GetUint("userId")
	//no need to check userId is not zero as this passess auth middleware
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

	var belugaBalance []gin.H
	var holdingValue = decimal.NewFromInt(0)

	for _, holding := range belugaHoldings {
		belugaBalance = append(belugaBalance, gin.H{
			"level":    holding.Level,
			"quantity": holding.Quantity,
			"value":    holding.Value,
		})
		holdingValue = holdingValue.Add(holding.Value.Mul(decimal.NewFromInt(int64(holding.Quantity))))
	}

	startOfToday := utils.StartOfDay()

	var withdrawnDetails withdrawn

	sql := "SELECT sum(amount) as total FROM withdrawls WHERE user_id = ? AND created_at >= ? GROUP BY user_id"
	if err := db.DB.Raw(sql, userId, startOfToday).Scan(&withdrawnDetails.Total).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "Profile Fetched",
		"data": gin.H{
			"username":        user.Name,
			"wallet_address":  user.WalletAddress,
			"coins":           user.Coins,
			"profile_id":      user.ProfileId,
			"balance":         belugaBalance,
			"holding_value":   holdingValue.String(),
			"withdrawn_today": withdrawnDetails.Total.String(),
		},
	})
}
