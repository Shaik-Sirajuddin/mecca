package utils

import (
	withdrawStatus "beluga/api/enums"
	"beluga/db"
	"beluga/models"
	"fmt"
	"time"

	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

type Mutex struct {
	c chan struct{}
}

// NewMutex creates a new mutex with a channel to simulate TryLock
func NewMutex() *Mutex {
	m := &Mutex{c: make(chan struct{}, 1)}
	m.c <- struct{}{}
	return m
}

// TryLock attempts to lock the mutex, returns false if already locked
func (m *Mutex) TryLock() bool {
	select {
	case <-m.c:
		return true
	default:
		return false
	}
}

// Unlock releases the mutex
func (m *Mutex) Unlock() {
	m.c <- struct{}{}
}

// Global mutex
var mu = NewMutex()

func queueWithdrawl() {
	var withdraw models.Withdrawl

	err := db.DB.Model(&models.Withdrawl{}).Where("status = 0").Order("created_at asc").First(&withdraw)

	if err.Error != nil || withdraw.ID == 0 {
		return
	}

	if !mu.TryLock() {
		fmt.Println("Another instance is already processing, exiting...")
		return
	}

	defer func() {
		time.Sleep(2 * time.Second) // Sleep for 2 seconds before unlocking
		mu.Unlock()
	}()

	println("Processing withdrawl ", withdraw.ID)

	result, hash := TransferSPLTokens(withdraw.Address, withdraw.Amount.String())

	println("withdrawl result" , result , hash);
	tx := db.DB.Begin()

	if result {
		if err := tx.Model(models.User{}).Where("id=?", withdraw.UserId).UpdateColumn("claimed_coins", gorm.Expr("claimed_coins + ?", withdraw.Amount.String())).Error; err != nil {
			tx.Rollback()
			return
		}
	} else {
		if err := tx.Model(models.User{}).Where("id=?", withdraw.UserId).UpdateColumn("coins", gorm.Expr("coins + ?", withdraw.Amount.String())).Error; err != nil {
			tx.Rollback()
			return
		}
	}

	var updatedStatus = withdrawStatus.SUCCESS
	if !result {
		updatedStatus = withdrawStatus.FAILED
	}

	withdraw.Hash = hash
	if err := tx.Model(&withdraw).Updates(
		map[string]interface{}{"status": updatedStatus, "hash": hash}).Error; err != nil {
		tx.Rollback()
		return
	}

	tx.Commit()

}
func StartJob() {
	c := cron.New()

	// Schedule a job to run every minute
	c.AddFunc("@every 1s", func() {
		queueWithdrawl()
	})

	// Start the cron scheduler
	c.Start()
}
