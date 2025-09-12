package models

type User struct {
	ID       string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Username string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"default:user"`
}

type Association struct {
	ID			string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LegalName 	string `gorm:"not null"`
	FilterName 	string `gorm:"not null"`
	Location 	string `gorm:"not null"`
	ManagerId 	int	   `gorm:"not null"`
}

type Manager struct {
	ID 			string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email 		string `gorm:"uniqueIndex;not null"`
	Name 		string `gorm:"not null"`
	Titles 		string `gorm:"not null"`
	Initials 	string `gorm:"not null"`
}