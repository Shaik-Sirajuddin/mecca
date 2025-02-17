package game

import (
	"beluga/api/utils"
	"beluga/db"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func LeaderBoard(c *gin.Context) {

	userId := c.GetUint("userId")

	type LeaderBoardEntry struct {
		AccumulatedValue decimal.Decimal `json:"accumulated_value"`
		Name             string          `json:"name"`
		Address          string          `json:"address"`
		Rank             uint            `json:"rank"`
	}

	var rankList []LeaderBoardEntry
	err := db.DB.Raw(`
		SELECT 	
		CAST(
			(MIN(u.coins) + MAX(u.claimed_coins) + SUM(bh.quantity * bv.value)) 
			AS DECIMAL(32,18)
		) AS accumulated_value, 
		u.name AS name,
		u.wallet_address AS address
		FROM 
			beluga_holdings AS bh 
		JOIN 
			beluga_variants AS bv ON bh.beluga_id = bv.id 
		JOIN 
			users AS u ON bh.user_id = u.id 
		GROUP BY 
			u.id
		order by accumulated_value desc
		LIMIT 10;
	`).Scan(&rankList).Error

	if err != nil {
		utils.ResIntenalError(c)
		return
	}

	//fetch users rank
	type UserRank struct {
		Rank decimal.Decimal `json:"rank"`
	}
	userRank := UserRank{}

	err = db.DB.Raw(`
		WITH ranked_users AS (
		SELECT 
			u.id AS user_id,
			RANK() OVER (ORDER BY 
				CAST(
					(MIN(u.coins) + MAX(u.claimed_coins) + SUM(bh.quantity * bv.value)) 
					AS DECIMAL(32,18)
				) DESC
			) AS user_rank
		FROM 
			beluga_holdings AS bh 
		JOIN 
			beluga_variants AS bv ON bh.beluga_id = bv.id 
		JOIN 
			users AS u ON bh.user_id = u.id 
		GROUP BY 
			u.id
	)
	SELECT user_rank as rank FROM ranked_users WHERE user_id = ?;
	`, userId).Scan(&userRank.Rank).Error

	if err != nil {
		utils.ResIntenalError(c)
		return
	}

	for i, entry := range rankList {
		entry.Rank = uint(i + 1)
		rankList[i] = entry
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"rankList":  rankList,
		"user_rank": userRank.Rank,
	})
}
