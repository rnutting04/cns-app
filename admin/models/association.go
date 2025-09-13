package models

type Association struct {
	ID			string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LegalName 	string `gorm:"not null"`
	FilterName 	string `gorm:"not null"`
	Location 	string `gorm:"not null"`
	ManagerID   string `gorm:"type:uuid;not null"`
	Manager     Manager `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`


}
