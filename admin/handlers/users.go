package handlers

import (
	"admin/db"
	"admin/models"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// GET /api/admin/users
func ListUsers(c *fiber.Ctx) error {
	var users []models.User
	if err := db.DB.Select("id", "username", "role", "permissions").Find(&users).Error; err != nil {
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

// DELETE /api/admin/users/:id
func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := db.DB.Delete(&models.User{},"id = ?", id).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete user"})
	}
	return c.JSON(fiber.Map{"message": "User deleted successfully"})
}
