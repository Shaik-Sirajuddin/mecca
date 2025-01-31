package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type User struct {
	ID               uint
	TelegramId       uint            `gorm:"not null"`
	Name             string          `gorm:"not null;default:''"`
	ProfileId        uint            `gorm:"not null;default:1"`
	WalletAddress    string          `gorm:"not null;default:''"`
	ReferralCode     string          `gorm:"not null;default:''"`
	AdditionalPlayed uint            `gorm:"not null"`
	Coins            decimal.Decimal `gorm:"not null;default:0;type:decimal(32,18)"`
	ClaimedCoins     decimal.Decimal `gorm:"not null;default:0;type:decimal(32,18)"`
	CreatedAt        time.Time       `gorm:"not null;autoCreateTime"`
	UpdatedAt        time.Time       `gorm:"not null;autoCreateTime"`
}
