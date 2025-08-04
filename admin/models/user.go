package models

import (
	"github.com/lib/pq"
)

type User struct {
	ID       string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Username string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"default:user"`
	Permissions pq.StringArray `gorm:"type:text[]"`
}
