package auth

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"beluga/session"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"


	"github.com/gin-gonic/gin"
)

type TelegramUser struct {
	ID              uint   `json:"id"`
	Username        string `json:"username"`
	FirstName       string `json:"first_name"`
	LastName        string `json:"last_name"`
	LanguageCode    string `json:"language_code"`
	AllowsWriteToPM bool   `json:"allows_write_to_pm"`
}

type LoginBody struct {
	InitData     string `json:"init_data" binding:"required"`
	TelegramID   uint   `json:"telegram_id"`
	ReferralCode string `json:"referral_code"`
	SecurityCode string `json:"security_code"`
}

func getUniqueReferralCode() (bool, string) {
	var referralCode string
	for {
		referralCode = utils.GenerateReferralCode()
		var user models.User
		if err := db.DB.Find(&user).Where("referral_code = ?", referralCode).Error; err != nil {
			if err.Error() != "record not found" {
				return false, ""
			}
		} else {
			return true, referralCode
		}
	}
}
func Login(c *gin.Context) {
	var body LoginBody

	err := c.ShouldBindJSON(&body)

	var isValidBotRequest = body.SecurityCode == utils.SecurityCode && body.TelegramID != 0

	if !isValidBotRequest && err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Missing or invalid parametes in body",
		})
		return
	}

	authenticated, err := utils.CheckSignature(body.InitData)

	if !isValidBotRequest && err != nil {
		utils.ResIntenalError(c)
		return
	}
	if !isValidBotRequest && !authenticated {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Invalid authentication data",
		})
		return
	}

	values, err := url.ParseQuery(body.InitData)
	if !isValidBotRequest && err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Invalid authentication data",
		})
		return
	}

	// Extract and decode the user field
	userJSON := values.Get("user")
	var telegramUser TelegramUser
	err = json.Unmarshal([]byte(userJSON), &telegramUser)
	if !isValidBotRequest && err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Invalid authentication data",
		})
		return
	}

	telegramId := telegramUser.ID

	if isValidBotRequest {
		telegramId = body.TelegramID
	}

	//validate data from request with telegram api
	//TODO : Create user if doesn't exist + Create user beluga holdings entry with default quantity 0

	var user models.User

	if err := db.DB.Where("telegram_id = ?", telegramId).First(&user).Error; err != nil {
		if err.Error() != "record not found" {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{
				"error": "Interval server error",
			})
			return
		}
	}

	if user.ID != 0 {
		//user already exists ,
		//create referral code if doesn't exist
		if len(user.ReferralCode) == 0 {
			success, referralCode := getUniqueReferralCode()

			//failed to generate referral code
			if !success {
				println("failed to generate referral code")
				c.IndentedJSON(http.StatusInternalServerError, gin.H{
					"error": "Interval server error",
				})
				return
			}

			//updating referral code for user
			if err := db.DB.Model(&user).
				Update("referral_code", referralCode).Error; err != nil {
				c.IndentedJSON(http.StatusInternalServerError, gin.H{
					"error": "Interval server error",
				})
				println(err.Error())
				return
			}
		}

		//return session id
		sessionId, err := session.InitializeSession(c.Request.Context(), user.ID)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{
				"error": "Interval server error",
			})
			return
		}
		c.IndentedJSON(http.StatusOK, gin.H{
			"sessionId": sessionId,
		})
		return
	}
	// user doesn't exist create user and balance

	//generate referral code for user
	success, referralCode := getUniqueReferralCode()
	//failed to generate referral code
	if !success {
		println("failed to generate referral code")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"error": "Interval server error",
		})
		return
	}

	user = models.User{
		TelegramId:   telegramId,
		ReferralCode: referralCode,
		Name:         "beluga_" + strings.ToLower(utils.GenerateReferralCode()),
	}

	result := db.DB.Create(&user)
	if result.Error != nil || user.ID == 0 {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"error": "Interval server error",
		})
		return
	}

	//create entry in Referrals table if request is from Bot

	if isValidBotRequest {
		var referrer models.User
		if err := db.DB.Where("referral_code=?", body.ReferralCode).First(&referrer).Error; err != nil {
			println(err.Error())
			utils.ResIntenalError(c)
			return
		}

		var referralItem = models.Referrals{
			ReferrerId:   referrer.ID,
			RefereeId:    user.ID,
			ReferralCode: body.ReferralCode,
		}

		if err := db.DB.Create(&referralItem).Error; err != nil {
			utils.ResIntenalError(c)
			return
		}
	}

	defaultHoldings := []models.BelugaHolding{}
	for index := range 10 {
		defaultHoldings = append(defaultHoldings, models.BelugaHolding{
			BelugaId: uint(index + 1),
			UserId:   user.ID,
		})
	}

	result = db.DB.Create(&defaultHoldings)

	if result.Error != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"error": "Interval server error",
		})
		return
	}

	sessionId, err := session.InitializeSession(c.Request.Context(), user.ID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"error": "Interval server error",
		})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{
		"sessionId": sessionId,
	})
}
