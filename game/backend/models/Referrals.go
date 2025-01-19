package models

import (
	"time"
)

type Referrals struct {
	ID           uint
	ReferrerId   uint      `gorm:"not null"`
	RefereeId    uint      `gorm:"not null"`
	ReferralCode string    `gorm:"not null;default:''"`
	Success      bool      `gorm:"not null"`
	CreatedAt    time.Time `gorm:"not null;autoCreateTime"`
	UpdatedAt    time.Time `gorm:"not null;autoCreateTime"`
}
