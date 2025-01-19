package db

import (
	"beluga/models"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func syncModels() {

	DB.AutoMigrate(&models.User{})
	DB.AutoMigrate(&models.BelugaHolding{})
	DB.AutoMigrate(&models.BelugaVariant{})
	DB.AutoMigrate(&models.GameRound{})
	DB.AutoMigrate(&models.Withdrawl{})
	DB.AutoMigrate(&models.Referrals{})

	defaultVariants := []models.BelugaVariant{
		{Level: 1, Value: decimal.NewFromFloat(0.1), Prob: 36},
		{Level: 2, Value: decimal.NewFromFloat(0.5), Prob: 22.5},
		{Level: 3, Value: decimal.NewFromFloat(1), Prob: 15},
		{Level: 4, Value: decimal.NewFromFloat(5), Prob: 10},
		{Level: 5, Value: decimal.NewFromFloat(10), Prob: 7},
		{Level: 6, Value: decimal.NewFromFloat(30), Prob: 5},
		{Level: 7, Value: decimal.NewFromFloat(50), Prob: 2},
		{Level: 8, Value: decimal.NewFromFloat(100), Prob: 1.5},
		{Level: 9, Value: decimal.NewFromFloat(1000), Prob: 0.95},
		{Level: 10, Value: decimal.NewFromFloat(100000), Prob: 0.05},
	}

	for _, variant := range defaultVariants {
		DB.FirstOrCreate(&variant, models.BelugaVariant{Level: variant.Level})
	}
}

func Init() {
	dbConfig := gin.H{
		"user": os.Getenv("MYSQL_USERNAME"),
		"pass": os.Getenv("MYSQL_PASSWORD"),
		"db":   os.Getenv("MYSQL_DATABASE"),
		"url":  os.Getenv("MYSQL_URL"),
	}
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbConfig["user"], dbConfig["pass"], dbConfig["url"], dbConfig["db"],
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to Database", err)
	}

	syncModels()
}
