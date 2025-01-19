package models

import (
	"time"

	"github.com/shopspring/decimal"
)

/*
Status

	pending - 0
	completed - 1
	failed - 2
*/
type Withdrawl struct {
	ID        uint
	UserId    uint            `gorm:"not null"`
	Address   string          `gorm:"not null"`
	Hash      string          `gorm:"not null;default:''"`
	Amount    decimal.Decimal `gorm:"not null;default:0;type:decimal(32,18)"`
	Status    uint            `gorm:"not null;default:0"`
	CreatedAt time.Time       `gorm:"not null;autoCreateTime"`
	UpdatedAt time.Time       `gorm:"not null;autoCreateTime"`
}
