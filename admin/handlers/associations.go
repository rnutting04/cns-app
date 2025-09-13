package handlers

import (
	"admin/db"
	"admin/models"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// GET /api/admin/data/associations?q=alpha
func ListAssociations(c *fiber.Ctx) error {
	q := strings.TrimSpace(c.Query("q"))
	var list []models.Association

	tx := db.DB.Preload("Manager")
	if q != "" {
		p := "%" + q + "%"
		tx = tx.Where(
			"legal_name ILIKE ? OR filter_name ILIKE ? OR location ILIKE ?",
			p, p, p,
		)
	}

	if err := tx.Order("legal_name asc").Find(&list).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load associations"})
	}
	return c.JSON(list)
}

// POST /api/admin/data/associations
// Body: { "legalName": "...", "filterName": "...", "location": "...", "managerId": "uuid" }
func CreateAssociation(c *fiber.Ctx) error {
	var in struct {
		LegalName  string `json:"legalName"`
		FilterName string `json:"filterName"`
		Location   string `json:"location"`
		ManagerID  string `json:"managerId"`
	}
	if err := c.BodyParser(&in); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if in.LegalName == "" || in.FilterName == "" || in.Location == "" || in.ManagerID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "All fields required"})
	}

	// ensure manager exists
	var m models.Manager
	if err := db.DB.First(&m, "id = ?", in.ManagerID).Error; err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Manager not found"})
	}

	a := models.Association{
		LegalName:  in.LegalName,
		FilterName: in.FilterName,
		Location:   in.Location,
		ManagerID:  in.ManagerID,
	}
	if err := db.DB.Create(&a).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Create failed"})
	}
	return c.Status(http.StatusCreated).JSON(a)
}

// PUT /api/admin/data/associations/:id
// Body (any subset): { "legalName": "...", "filterName": "...", "location": "...", "managerId": "uuid" }
func UpdateAssociation(c *fiber.Ctx) error {
	id := c.Params("id")
	var in struct {
		LegalName  *string `json:"legalName"`
		FilterName *string `json:"filterName"`
		Location   *string `json:"location"`
		ManagerID  *string `json:"managerId"`
	}
	if err := c.BodyParser(&in); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	updates := map[string]any{}
	if in.LegalName != nil {
		updates["legal_name"] = strings.TrimSpace(*in.LegalName)
	}
	if in.FilterName != nil {
		updates["filter_name"] = strings.TrimSpace(*in.FilterName)
	}
	if in.Location != nil {
		updates["location"] = strings.TrimSpace(*in.Location)
	}
	if in.ManagerID != nil {
		// verify new manager exists
		var m models.Manager
		if err := db.DB.First(&m, "id = ?", *in.ManagerID).Error; err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Manager not found"})
		}
		updates["manager_id"] = *in.ManagerID
	}
	if len(updates) == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "No changes"})
	}

	if err := db.DB.Model(&models.Association{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Update failed"})
	}
	return c.JSON(fiber.Map{"message": "Updated"})
}

// DELETE /api/admin/data/associations/:id
func DeleteAssociation(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := db.DB.Delete(&models.Association{}, "id = ?", id).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Delete failed"})
	}
	return c.JSON(fiber.Map{"message": "Deleted"})
}
