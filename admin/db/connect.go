package db

import (
	"admin/models"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := os.Getenv("DATABASE_URL") // or construct with host/user/pass/port/dbname
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate the User model
	if err := db.AutoMigrate(&models.User{}, &models.Association{}, &models.Manager{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
	fmt.Println("✅ Admin connected to PostgreSQL")
}
