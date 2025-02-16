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

type UserResponseItem struct {
	ID             uint            `json:"id"`
	Name           string          `json:"name"`
	WalletAddress  string          `json:"wallet_address"`
	Coins          decimal.Decimal `json:"coins"`
	ClaimedCoins   decimal.Decimal `json:"claimed_coins"`
	HoldingValue   decimal.Decimal `json:"holding_value"`
	TotalReferrals uint            `json:"total_referrals"`
}

// StatsWithPagination fetches users and their holdings with pagination
func Users(c *gin.Context) {
	// Get pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	key := (c.DefaultQuery("key", ""))
	key = key + "%"
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	// Slice to store results
	var usersHoldings []UserResponseItem
	println("key")
	println("{}", key)

	// Query to fetch users and their holdings
	if err := db.DB.Raw(`
		SELECT (u.id - 183) as id, u.telegram_id, u.name, u.wallet_address, u.coins, u.claimed_coins,
			COALESCE(uh.holding_value, 0) AS holding_value,
			COALESCE(ur.total_referrals, 0) AS total_referrals,
			tr.total_referrals_made
		FROM users u
		LEFT JOIN (
			-- Compute holding value per user
			SELECT bh.user_id, SUM(bv.value * bh.quantity) AS holding_value
			FROM beluga_holdings bh
			LEFT JOIN beluga_variants bv ON bh.beluga_id = bv.id
			GROUP BY bh.user_id
		) uh ON u.id = uh.user_id
		LEFT JOIN (
			-- Compute total referrals per user
			SELECT r.referrer_id AS user_id, COUNT(*) AS total_referrals
			FROM referrals r
			GROUP BY r.referrer_id
		) ur ON u.id = ur.user_id
		JOIN (
			-- Compute total referrals made by all users (moved from CROSS JOIN to a separate subquery)
			SELECT COUNT(*) AS total_referrals_made FROM referrals
		) tr
		WHERE u.name LIKE ? OR u.wallet_address LIKE ?
		ORDER BY u.id
		LIMIT ? OFFSET ?;


	`, key, key, limit, offset).Scan(&usersHoldings).Error; err != nil {
		println(err.Error())
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
