package main

import (
	"beluga/api/router"
	"beluga/api/utils"
	"beluga/db"
	"beluga/session"
	"log"
	"time"

	"github.com/joho/godotenv"
)

func loadEnv() {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal("Error loading .env file")
	}
}
func test() {
	diff := time.Since(time.Date(2024, time.August, 24, 0, 0, 0, 0, time.Local))
	println(uint(diff.Hours() - float64(time.Now().Hour())))
}
func main() {
	test()
	loadEnv()
	db.Init()
	session.Init()
	utils.StartJob()
	router.Init()
}
