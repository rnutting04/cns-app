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
	db.SeedTestData()
    app := fiber.New()

    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173",
        AllowCredentials: true,
        AllowMethods: "GET,POST,DELETE,OPTIONS,PUT",
        AllowHeaders: "Origin, Content-Type, Accept",
    }))

    admin := app.Group("/api/admin",
        middleware.JWTProtected(),
		middleware.RequireAnyRole("super", "admin"),
    )
	

	admin.Get("/users", handlers.ListUsers)
	admin.Post("/users", handlers.CreateUser)
	admin.Delete("/users/:id", handlers.DeleteUser)
	admin.Put("/users/:id/role", handlers.UpdateUserRole)
    
	data := admin.Group("/data",
		middleware.JWTProtected(),
		middleware.RequireAnyRole("super", "admin"),
	)

	data.Get("/associations", handlers.ListAssociations)
	data.Post("/associations", handlers.CreateAssociation)
	data.Delete("/associations/:id", handlers.DeleteAssociation)
	data.Put("/associations/:id", handlers.UpdateAssociation)
    
	data.Get("/managers", handlers.ListManagers)
	data.Post("/managers", handlers.CreateManager)
	data.Delete("/managers/:id", handlers.DeleteManager)
	data.Put("/managers/:id", handlers.UpdateManager)
	


    port := os.Getenv("PORT")
    if port == "" {
        port = "8082"
    }

    app.Listen(":" + port)
}
