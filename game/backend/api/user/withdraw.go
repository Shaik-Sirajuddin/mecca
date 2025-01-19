package user

import (
	withdrawStatus "beluga/api/enums"
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"github.com/xssnick/tonutils-go/address"
	"gorm.io/gorm/clause"
)

type withdrawn struct {
	Total decimal.Decimal `json:"total"`
}

func processWithdrawl(userId uint, amountToWithdraw decimal.Decimal) {
	var user models.User

	var tx = db.DB.Begin()
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Find(&user, userId).Error; err != nil {
		println("user row locked returning")
		tx.Rollback()
		return
	}
	if user.Coins.LessThanOrEqual(amountToWithdraw) {
		println("insufficient amount")
		tx.Rollback()
		return
	}

	startOfToday := utils.StartOfDay()

	var withdrawnDetails withdrawn

	sql := "SELECT sum(amount) as total FROM withdrawls WHERE user_id = ? AND created_at >= ? AND status in (0,1) GROUP BY user_id"
	if err := tx.Raw(sql, userId, startOfToday).Scan(&withdrawnDetails.Total).Error; err != nil {
		tx.Rollback()
		return
	}

	if withdrawnDetails.Total.Add(amountToWithdraw).GreaterThan(decimal.NewFromInt(100000)) {
		tx.Rollback()
		return
	}
	//maximum withdrawl limit 10000 per transaction
	//limit total of 100,000 coins withdrawl per day
	var transferAmount = amountToWithdraw

	var address = user.WalletAddress

	user.Coins = user.Coins.Sub(transferAmount)

	if err := tx.Model(&user).Update("coins", user.Coins).Error; err != nil {
		tx.Rollback()
		return
	}
	var withdrawlAttempt = models.Withdrawl{
		UserId:  userId,
		Address: address,
		Amount:  transferAmount,
		Status:  withdrawStatus.PENDING,
	}

	if err := tx.Create(&withdrawlAttempt).Error; err != nil {
		tx.Rollback()
		return
	}

	tx.Commit()
}

type WithdrawBody struct {
	Amount decimal.Decimal `json:"amount" binding:"required"`
}

func Withdraw(c *gin.Context) {
	userId := c.GetUint("userId")

	var user models.User
	if err := db.DB.Find(&user, userId).Error; err != nil {
		println("this 3")
		utils.ResIntenalError(c)
		return
	}
	var body WithdrawBody

	err := c.ShouldBindJSON(&body)

	println(body.Amount.String())

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Amount",
		})
		return
	}

	if body.Amount.LessThan(decimal.NewFromInt(100)) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Minimum of 100 coins are required for withdrawl",
		})
		return
	}

	if user.Coins.LessThan((body.Amount)) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Amuont exceeds balance",
		})
		return
	}

	if (body.Amount).GreaterThan(decimal.NewFromInt(10000)) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Maximum amount per withdrawl is 10000",
		})
		return
	}

	_, err = address.ParseAddr(user.WalletAddress)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Please update your wallet address first",
		})
		return
	}

	startOfToday := utils.StartOfDay()

	var withdrawnDetails withdrawn

	sql := "SELECT sum(amount) as total FROM withdrawls WHERE user_id = ? AND created_at >= ?  AND status in (0,1)  GROUP BY user_id"
	if err := db.DB.Raw(sql, userId, startOfToday).Scan(&withdrawnDetails.Total).Error; err != nil {
		println("this 2")
		utils.ResIntenalError(c)
		return
	}

	if withdrawnDetails.Total.Add((body.Amount)).GreaterThanOrEqual(decimal.NewFromInt(100000)) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Amount exceeds daily withdraw limit",
		})
		return
	}

	var withdrawDetails models.Withdrawl

	if err := db.DB.Model(models.Withdrawl{}).Where("user_id = ?", userId).Order("created_at desc").First(&withdrawDetails).Error; err != nil {
		if err.Error() != "record not found" {
			utils.ResIntenalError(c)
			return
		}
	}

	if withdrawDetails.ID != 0 {
		difTime := time.Since(withdrawDetails.CreatedAt)
		if difTime.Minutes() < 2 {
			c.IndentedJSON(http.StatusBadRequest, gin.H{
				"error": "Withdraw request can be attempted after " + strconv.Itoa(2-int(difTime.Minutes())) + " minutes",
			})
			return
		}
	}

	go processWithdrawl(userId, body.Amount)
	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "Withdrawl initiated",
	})
}
