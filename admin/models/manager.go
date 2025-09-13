package models

type Manager struct {
	ID 			string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email 		string `gorm:"uniqueIndex;not null"`
	Name 		string `gorm:"not null"`
	Titles 		string `gorm:"not null"`
	Initials 	string `gorm:"not null"`
	Associations    []Association `gorm:"foreignKey:ManagerID"`
}

