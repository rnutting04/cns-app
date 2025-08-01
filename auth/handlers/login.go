package handlers

import (
	"time"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"auth/db"
	"auth/models"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

type LoginInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Login(c *fiber.Ctx) error {
	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	user := models.User{}
	err := db.DB.Where("username = ?", input.Username).First(&user).Error

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "User not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid password"})
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": input.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(2 * time.Hour).Unix(),
	})

	signedToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create token"})
	}
	
	// Set secure HTTP-only cookie
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    signedToken,
		Expires:  time.Now().Add(2 * time.Hour),
		HTTPOnly: true,
		Secure:   true, // use HTTPS in production!
		SameSite: "Lax", // or "Strict" if no cross-site POSTs
		Path:     "/",
	})

	return c.JSON(fiber.Map{"token": signedToken})
}

func Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HTTPOnly: true,
		Secure:   true, // use HTTPS in production!
		SameSite: "Lax", // or "Strict" if no cross-site POSTs
		Path:     "/",
	})
	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}

func Me(c *fiber.Ctx) error {
    userToken := c.Cookies("token")
    if userToken == "" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "No token"})
    }

    claims := jwt.MapClaims{}
    token, err := jwt.ParseWithClaims(userToken, claims, func(t *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })

    if err != nil || !token.Valid {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
    }

    return c.JSON(fiber.Map{
        "username": claims["username"],
        "role":     claims["role"],
    })
}
