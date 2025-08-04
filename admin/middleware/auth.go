package middleware

import (
	"os"
	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v3"
	"github.com/golang-jwt/jwt/v4"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func JWTProtected() fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey:    jwtSecret,
		ContextKey:    "user", // stored in c.Locals("user")
		TokenLookup:   "cookie:token",
		SigningMethod: "HS256",
	})
}

func RequireAdmin(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token) // jwt.Token from jwt/v4
	claims := user.Claims.(jwt.MapClaims) // jwt.MapClaims from jwt/v4

	role, ok := claims["role"].(string)
	if !ok || role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Admins only",
		})
	}

	return c.Next()
}
