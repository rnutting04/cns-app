package handlers

import (
	"admin/db"
	"admin/models"
	"log"
	"net/http"
	"strings"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)
func isSuperUser(u *models.User) bool { return u.Role == "super" }

// GET /api/admin/users
func ListUsers(c *fiber.Ctx) error {
	var users []models.User
	if err := db.DB.Select("id", "username", "role").Find(&users).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch users"})
	}
	return c.JSON(users)
}

// POST /api/admin/users
func CreateUser(c *fiber.Ctx) error {
	var input models.User
	if err := c.BodyParser(&input); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if strings.ToLower(input.Role) == "super" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Cannot create super user"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	input.Password = string(hashedPassword)
	if err := db.DB.Create(&input).Error; err != nil {
		log.Println("Error creating user:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create user"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "User created successfully"})
}

// PUT /api/admin/users/:id/role
func UpdateUserRole(c *fiber.Ctx) error {
    id := c.Params("id")

    var u models.User
    if err := db.DB.First(&u, "id = ?", id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "User not found"})
    }

	if u.ID == id {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot update self"})
	}
	
	
    if isSuperUser(&u) {
        return c.Status(403).JSON(fiber.Map{"error": "Cannot modify super user"})
    }

    var input models.User
    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
    }

    u.Role = input.Role
    if err := db.DB.Save(&u).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to update user"})
    }

    return c.JSON(fiber.Map{"message": "User updated successfully"})
}

// DELETE /api/admin/users/:id
func DeleteUser(c *fiber.Ctx) error {
    id := c.Params("id")

    var u models.User
    if err := db.DB.First(&u, "id = ?", id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "User not found"})
    }
    if isSuperUser(&u) {
        return c.Status(403).JSON(fiber.Map{"error": "Cannot delete super user"})
    }

    if err := db.DB.Delete(&u).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to delete user"})
    }
    return c.JSON(fiber.Map{"message": "User deleted"})
}
