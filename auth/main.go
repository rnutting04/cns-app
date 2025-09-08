package main

import (
	"auth/handlers"
	"auth/db"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"github.com/gofiber/fiber/v2"
)

func main() {
	db.InitDB()
	db.SeedSuperUser(db.DB)
	db.SeedUsers(db.DB)
    app := fiber.New()
    // ✅ Allow all origins for dev
    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173",
        AllowHeaders: "Origin, Content-Type, Accept",
        AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowCredentials: true,
    }))

    app.Post("/api/auth/login", handlers.Login)
    app.Get("/api/auth/me", handlers.Me)
    app.Post("/api/auth/logout", handlers.Logout)

    app.Listen(":8080")
}
