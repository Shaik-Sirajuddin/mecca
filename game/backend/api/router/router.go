package router

import (
	"beluga/api/admin"
	"beluga/api/auth"
	"beluga/api/beluga"
	"beluga/api/game"
	"beluga/api/middleware"
	"beluga/api/user"

	"github.com/gin-gonic/gin"
)

var router *gin.Engine

func Init() {
	router = gin.Default()

	router.Use(middleware.CORSMiddleware())

	authR := router.Group("/auth")
	{
		authR.POST("/login", auth.Login)
	}
	userR := router.Group("/user", middleware.AuthRequired)
	{
		userR.GET("/profile", user.Profile)
		userR.POST("/withdraw", user.Withdraw)
		userR.POST("/profile/update", user.UpdateProfile)
		userR.GET("/referral_details", user.GetReferralData)
		userR.GET("/referral_count", user.GetReferralCountApi)
	}

	router.POST("/user/referral_details", user.GetReferralData)
	router.POST("/user/referral_count", user.GetReferralCountApi)

	belugaR := router.Group("/beluga", middleware.AuthRequired)
	{
		belugaR.POST("/mix", beluga.Mix)
		belugaR.POST("/convert", beluga.Convert)
	}

	gameR := router.Group("/game", middleware.AuthRequired)
	{
		gameR.GET("/current", game.CurrentSlot)
		gameR.POST("/tap", game.Tap)
		gameR.POST("/claim", game.Claim)
		gameR.GET("/leaderboard", game.LeaderBoard)
	}

	adminR := router.Group("/admin", middleware.Admin)
	{
		adminR.GET("/stats", admin.Stats)
		adminR.GET("/user-count", admin.UserCount)
		adminR.GET("/users", admin.Users)
	}

	router.Run("localhost:8002")
}
