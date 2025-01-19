package models

import "time"

type BelugaHolding struct {
	ID        uint
	UserId    uint      `gorm:"not null"`
	BelugaId  uint      `gorm:"not null"`
	Quantity  uint      `gorm:"not null;default:0"`
	CreatedAt time.Time `gorm:"not null;autoCreateTime"`
	UpdatedAt time.Time `gorm:"not null;autoCreateTime"`
}
