package user

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ReferralDataBody struct {
	TelegramID   uint   `json:"telegram_id" binding:"required"`
	SecurityCode string `json:"security_code"`
}

type ReferralCount struct {
	Total            uint `json:"total"`
	Successful       uint `json:"successful"`
	AdditionalRounds uint `json:"additional_rounds"`
	ClaimedRounds    uint `json:"claimed_rounds"`
	UncliamedRounds  uint `json:"unclaimed_rounds"`
}

func GetReferralCount(userId uint) (bool, ReferralCount) {

	var referralCount ReferralCount

	sql := "SELECT count(*) as total FROM referrals WHERE referrer_id = ?"
	if err := db.DB.Raw(sql, userId).Scan(&referralCount.Total).Error; err != nil {
		return false, referralCount
	}

	sql = "SELECT count(*) as total FROM referrals WHERE success and referrer_id = ?"
	if err := db.DB.Raw(sql, userId).Scan(&referralCount.Successful).Error; err != nil {
		return false, referralCount
	}

	//todo select particular columns
	var user models.User
	db.DB.First(&user, userId)

	referralCount.AdditionalRounds = referralCount.Successful / 4
	referralCount.ClaimedRounds = user.AdditionalPlayed
	referralCount.UncliamedRounds = referralCount.AdditionalRounds - referralCount.ClaimedRounds

	return true, referralCount
}

func GetReferralCountApi(c *gin.Context) {
	var body ReferralDataBody

	err := c.ShouldBindJSON(&body)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Missing or invalid parametes in body",
		})
		return
	}

	if body.SecurityCode != utils.SecurityCode {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "UNAUTHORIZED",
		})
		return
	}

	var user models.User

	if err := db.DB.Where("telegram_id=?", body.TelegramID).First(&user).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	success, referralCount := GetReferralCount(user.ID)

	if !success {
		utils.ResIntenalError(c)
		return
	}

	c.IndentedJSON(http.StatusOK, referralCount)
}
func GetReferralData(c *gin.Context) {
	var body ReferralDataBody

	err := c.ShouldBindJSON(&body)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Missing or invalid parametes in body",
		})
		return
	}

	if body.SecurityCode != utils.SecurityCode {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "UNAUTHORIZED",
		})
		return
	}

	var user models.User

	if err := db.DB.Where("telegram_id=?", body.TelegramID).First(&user).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	type Referee struct {
		Name string `json:"name"`
	}
	var refereeList []Referee

	err = db.DB.Raw(`
		 SELECT users.name from referrals 
		 join users on referrals.referee_id = users.id where referrals.referrer_id = ?
	`, user.ID).Scan(&refereeList).Error

	if err != nil {
		utils.ResIntenalError(c)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"referral_code": user.ReferralCode,
		"referee_list":  refereeList,
	})
}
