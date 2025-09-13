package db

import (
    "log"
    "admin/models"
)

func SeedTestData() {
    var count int64
    DB.Model(&models.Manager{}).Count(&count)
    if count > 0 {
        log.Println("🔒 Seed skipped, managers already exist")
        return
    }

    // Create managers
    m1 := models.Manager{Name: "Alice Johnson", Email: "alice@example.com", Titles: "Regional Manager", Initials: "AJ"}
    m2 := models.Manager{Name: "Bob Smith", Email: "bob@example.com", Titles: "District Manager", Initials: "BS"}
    m3 := models.Manager{Name: "Carol Lee", Email: "carol@example.com", Titles: "General Manager", Initials: "CL"}

    DB.Create(&m1)
    DB.Create(&m2)
    DB.Create(&m3)

    // Create associations
    DB.Create(&[]models.Association{
        {LegalName: "Sunset Condos", FilterName: "sunset", Location: "Tampa", ManagerID: m1.ID},
        {LegalName: "Palm Villas", FilterName: "palm", Location: "Orlando", ManagerID: m1.ID},
        {LegalName: "Ocean Breeze", FilterName: "ocean", Location: "Miami", ManagerID: m2.ID},
        {LegalName: "Lakeside Apartments", FilterName: "lake", Location: "Tampa", ManagerID: m2.ID},
        {LegalName: "Riverfront Homes", FilterName: "river", Location: "Jacksonville", ManagerID: m1.ID},
    })

    log.Println("✅ Seeded managers and associations")
}
