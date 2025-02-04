package admin

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

// StatsWithPagination fetches users and their holdings with pagination
func ExportUsers(c *gin.Context) {
	// Slice to store results
	var usersHoldings []UserResponseItem

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
		ORDER BY u.id;
	`).Scan(&usersHoldings).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	var belugaHoldings []HoldingResult

	result := db.DB.Model(&models.BelugaHolding{}).
		Select("beluga_holdings.quantity,beluga_holdings.beluga_id,beluga_holdings.user_id").
		Find(&belugaHoldings)

	if result.Error != nil {
		utils.ResIntenalError(c)
		return
	}

	//create excel sheet

	file := excelize.NewFile()

	headers := []string{"ID", "Name", "WalletAddress", "Coins", "Claimed", "HoldingValue", "TotalReferrals"}

	for i := 0; i < 10; i++ {
		headers = append(headers, fmt.Sprintf("Levevl-%d", i+1))
	}

	for i, header := range headers {
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+i)), 1), header)
	}
	userIndexMap := make(map[uint]int)

	for i, row := range usersHoldings {
		dataRow := i + 2
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+0)), dataRow), row.ID)
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+1)), dataRow), row.Name)
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+2)), dataRow), row.WalletAddress)
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+3)), dataRow), row.Coins)
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+4)), dataRow), row.ClaimedCoins)
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+5)), dataRow), row.HoldingValue)
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+6)), dataRow), row.TotalReferrals)
		userIndexMap[row.ID] = dataRow
	}

	for _, row := range belugaHoldings {
		file.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(65+6+row.Level)), userIndexMap[row.UserId]), row.Quantity)
	}

	if err := file.SaveAs("./assets/users.xlsx"); err != nil {
		log.Fatal(err)
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "File Created",
		"data": gin.H{
		},
	})
}
