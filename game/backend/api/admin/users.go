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

type User struct {
	ID            uint            `json:"id"`
	Name          string          `json:"name"`
	WalletAddress string          `json:"wallet_address"`
	Coins         decimal.Decimal `json:"coins"`
	ClaimedCoins  decimal.Decimal `json:"claimed_coins"`
	HoldingValue  decimal.Decimal `json:"holding_value"`
	TotalReferrals uint           `json:"total_referrals"`
}

// StatsWithPagination fetches users and their holdings with pagination
func Users(c *gin.Context) {
	// Get pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	// Slice to store results
	var usersHoldings []User

	// Query to fetch users and their holdings
	if err := db.DB.Raw(`
		SELECT u.id, u.telegram_id, u.name, u.wallet_address, u.coins, u.claimed_coins ,
			COALESCE(SUM(bv.value * bh.quantity), 0) AS holding_value,
			COALESCE(COUNT(r.referrer_id), 0) AS total_referrals
		FROM users u
		LEFT JOIN beluga_holdings bh ON u.id = bh.user_id
		LEFT JOIN beluga_variants bv ON bh.beluga_id = bv.id
		LEFT JOIN referrals r ON u.id = r.referrer_id
		GROUP BY u.id
		ORDER BY u.id
		LIMIT ? OFFSET ?;
	`, limit, offset).Scan(&usersHoldings).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	// Count total users for pagination info
	var totalUsers int64
	db.DB.Model(&models.User{}).Count(&totalUsers)

	// Return paginated data
	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "Data Fetched",
		"data": gin.H{
			"page":       page,
			"limit":      limit,
			"totalUsers": totalUsers,
			"users":      usersHoldings,
		},
	})
}
