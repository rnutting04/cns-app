package models

type User struct {
	ID       string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Username string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"default:user"`
}
