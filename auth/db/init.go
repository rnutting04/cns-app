package db

import (
    "auth/models"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
    "log"
    "os"
)

func SeedAdmin(db *gorm.DB) {
    var count int64
    db.Model(&models.User{}).Where("role = ?", "admin").Count(&count)

    if count == 0 {
        // ✅ Get the password from environment variable
        defaultPassword := os.Getenv("DEFAULT_ADMIN_PASSWORD")
        if defaultPassword == "" {
            log.Fatal("❌ DEFAULT_ADMIN_PASSWORD environment variable is not set")
        }

        // ✅ Hash the password securely
        hashed, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
        if err != nil {
            log.Fatalf("❌ Failed to hash password: %v", err)
        }

        // ✅ Create admin user
		admin := models.User{
			Username: "admin",
            Password: string(hashed),
            Role:     "admin",
        }

        if err := db.Create(&admin).Error; err != nil {
            log.Fatalf("❌ Failed to seed admin: %v", err)
        }

        log.Println("✅ Seeded default admin (username: admin)")
    } else {
        log.Println("🔒 Admin already exists, skipping seeding.")
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
		Permissions: []string{"doc_parser"}, // Only allow parser access
	}

	if err := db.Create(&user).Error; err != nil {
		log.Println("❌ Failed to seed regular user:", err)
		return
	}

	log.Println("✅ Seeded regular user: user1")
}
