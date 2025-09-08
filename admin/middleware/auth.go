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


func RequireAnyRole(roles ...string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        // Fiber's JWT middleware stores a *jwt.Token in Locals
        user, ok := c.Locals("user").(*jwt.Token)
        if !ok || user == nil {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Invalid or missing token",
            })
        }

        claims, ok := user.Claims.(jwt.MapClaims)
        if !ok {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Invalid claims",
            })
        }

        role, ok := claims["role"].(string)
        if !ok {
            return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
                "error": "Role missing from token",
            })
        }

        for _, allowed := range roles {
            if role == allowed {
                return c.Next() // ✅ allowed
            }
        }

        return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "error": "Insufficient privileges",
        })
    }
}
