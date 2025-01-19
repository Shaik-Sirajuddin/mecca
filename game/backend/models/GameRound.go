package models

import "time"

type GameRound struct {
	ID           uint
	UserId       uint `gorm:"not null"`
	RoundIndex   uint `gorm:"not null"`
	Taps         uint `gorm:"not null;default:0"`
	PickedBeluga *uint
	Claimed      bool      `gorm:"not null;default:false"`
	IsAdditional bool      `gorm:"not null;default:false"`
	StartTime    time.Time `gorm:"not null;default:current_timestamp(3)"`
	EndTime      *time.Time
	CreatedAt    time.Time `gorm:"not null;autoCreateTime"`
	UpdatedAt    time.Time `gorm:"not null;autoUpdateTime"`
}
