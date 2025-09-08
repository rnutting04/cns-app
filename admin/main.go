package main

import (
    "os"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "admin/handlers"
    "admin/middleware"
	"admin/db"
)

func main() {
	db.InitDB()
    app := fiber.New()

    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173",
        AllowCredentials: true,
        AllowMethods: "GET,POST,DELETE,OPTIONS",
        AllowHeaders: "Origin, Content-Type, Accept",
    }))

    admin := app.Group("/api/admin",
        middleware.JWTProtected(),
		middleware.RequireAdmin,
    )

	admin.Get("/users", handlers.ListUsers)
	admin.Post("/users", handlers.CreateUser)
	admin.Delete("/users/:id", handlers.DeleteUser)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8082"
    }

    app.Listen(":" + port)
}
