package game

import (
	userP "beluga/api/user"
	"beluga/db"
	"beluga/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

const dailyClaimLimit = 10

func startOfDay() time.Time {
	loc, err := time.LoadLocation("Asia/Seoul")
	if err != nil {
		panic(err) // handle error appropriately in real code
	}
	t := time.Now().In(loc)
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, loc)
}

/*
*

	Current Slot | Session Format
	{
		active : {
			taps : 10,
		} | null ,
		beforeNext : 0 // before wait duration in seconds
	}

*
*/

func GetGamesLeftToday(userId uint) uint {
	var claimsToday int64
	startOfToday := startOfDay()
	db.DB.Model(&models.GameRound{}).
		Where("user_id = ? and start_time >= ? and is_additional = false", userId, startOfToday).Count(&claimsToday)

	_, referralsCount := userP.GetReferralCount(userId)

	return uint(dailyClaimLimit) - uint(claimsToday) + referralsCount.UncliamedRounds
}

func GetWaitTime(userId uint) time.Duration {
	var gameRound models.GameRound
	var claimsToday int64
	startOfToday := startOfDay()
	db.DB.Model(&models.GameRound{}).
		Where("user_id = ? and start_time >= ? and is_additional = false", userId, startOfToday).Count(&claimsToday)

	var user models.User
	db.DB.First(&user, userId)

	_, referralsCount := userP.GetReferralCount(userId)

	if claimsToday >= int64(dailyClaimLimit) && referralsCount.UncliamedRounds <= 0 {
		waitTime := time.Hour*24 - time.Since(startOfToday)
		return waitTime
	}

	db.DB.Model(&models.GameRound{}).
		Where("user_id = ? and is_additional = false", userId).
		Order("end_time desc").First(&gameRound)

	//users first game since registration
	if gameRound.UserId == 0 || !gameRound.Claimed || referralsCount.UncliamedRounds > 0 {
		return time.Duration(0)
	}

	waitTime := 1*time.Minute - time.Since(*gameRound.EndTime)
	// waitTime := time.Duration(0)
	if waitTime > 0 {
		return waitTime
	}
	return time.Duration(0)
}

func CurrentSlot(c *gin.Context) {

	userId := c.GetUint("userId")

	var gameRound models.GameRound
	db.DB.Model(&models.GameRound{}).Where("user_id = ? and claimed = 0", userId).First(&gameRound)

	if gameRound.UserId != 0 {
		//active unclaimed session available
		c.IndentedJSON(http.StatusOK, gin.H{
			"active": gin.H{
				"taps": gameRound.Taps,
			},
			"waitTime": 0,
		})
		return
	}
	//no active session found , check if a session can be started
	//get previous session and total no of sessions today
	waitTime := GetWaitTime(userId)
	c.IndentedJSON(http.StatusOK, gin.H{
		"active":         nil,
		"waitTime":       waitTime.Milliseconds(),
		"unplayed_today": GetGamesLeftToday(userId),
	})
}
