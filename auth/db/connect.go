package db

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"auth/models"
)

var DB *gorm.DB

func InitDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=db user=user password=password dbname=cnsdb port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Failed to connect to DB: %v", err)
	}

	DB = db
	DB.AutoMigrate(&models.User{})
	fmt.Println("✅ Connected to PostgreSQL with GORM")
}
