package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type BelugaVariant struct {
	ID        uint
	Level     uint            `gorm:"not null"`
	Value     decimal.Decimal `gorm:"not null;default:0;type:decimal(32,18)"` //probability of occurence
	Prob      float32         `gorm:"not null"`                               //probability of occurence
	CreatedAt time.Time       `gorm:"not null;autoCreateTime"`
	UpdatedAt time.Time       `gorm:"not null;autoCreateTime"`
}
