package db

import (
    "auth/models"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
    "log"
    "os"
)

func SeedSuperUser(db *gorm.DB) {
    var count int64
    db.Model(&models.User{}).Where("role = ?", "super").Count(&count)

    if count == 0 {
        //  Get the password from environment variable
        defaultPassword := os.Getenv("DEFAULT_SUPER_USER_PASSWORD")
        if defaultPassword == "" {
            log.Fatal(" DEFAULT_SUPER_USER_PASSWORD environment variable is not set")
        }

        //  Hash the password securely
        hashed, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
        if err != nil {
            log.Fatalf(" Failed to hash password: %v", err)
        }

        //  Create super user
		superUser := models.User{
			Username: "super",
            Password: string(hashed),
            Role:     "super",
        }

        if err := db.Create(&superUser).Error; err != nil {
            log.Fatalf(" Failed to seed super user: %v", err)
        }

        log.Println(" Seeded default super user (username: super)")
    } else {
        log.Println(" Super user already exists, skipping seeding.")
    }
}

func SeedUsers(db *gorm.DB) {
	var user models.User
	if err := db.First(&user, "username = ?", "user1").Error; err == nil {
		log.Println("👤 Regular user already exists, skipping seeding.")
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)
	user = models.User{
		Username:    "user1",
		Password:    string(hashedPassword),
		Role:        "user",
	}

	if err := db.Create(&user).Error; err != nil {
		log.Println(" Failed to seed regular user:", err)
		return
	}

	log.Println(" Seeded regular user: user1")
}
