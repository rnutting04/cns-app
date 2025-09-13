package handlers

import (
	"admin/db"
	"admin/models"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GET /api/admin/data/managers?q=jane
func ListManagers(c *fiber.Ctx) error {
	q := strings.TrimSpace(c.Query("q"))
	var list []models.Manager

	tx := db.DB.Preload("Associations")
	if q != "" {
		p := "%" + q + "%"
		tx = tx.Where("name ILIKE ? OR email ILIKE ? OR initials ILIKE ?", p, p, p)
	}

	if err := tx.Order("name asc").Find(&list).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load managers"})
	}
	return c.JSON(list)
}

// POST /api/admin/data/managers
// Body: { "name": "...", "email": "...", "titles": "...", "initials": "JD" }
func CreateManager(c *fiber.Ctx) error {
	var in struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Titles   string `json:"titles"`
		Initials string `json:"initials"`
	}
	if err := c.BodyParser(&in); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	in.Name = strings.TrimSpace(in.Name)
	in.Email = strings.TrimSpace(in.Email)
	in.Titles = strings.TrimSpace(in.Titles)
	in.Initials = strings.TrimSpace(in.Initials)

	if in.Name == "" || in.Email == "" || in.Titles == "" || in.Initials == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "All fields required"})
	}

	m := models.Manager{
		Name:     in.Name,
		Email:    in.Email,
		Titles:   in.Titles,
		Initials: in.Initials,
	}
	if err := db.DB.Create(&m).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Create failed"})
	}
	return c.Status(http.StatusCreated).JSON(m)
}

// PUT /api/admin/data/managers/:id
// Body (any subset): { "name": "...", "email": "...", "titles": "...", "initials": "XX" }
func UpdateManager(c *fiber.Ctx) error {
	id := c.Params("id")
	var in struct {
		Name     *string `json:"name"`
		Email    *string `json:"email"`
		Titles   *string `json:"titles"`
		Initials *string `json:"initials"`
	}
	if err := c.BodyParser(&in); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	updates := map[string]any{}
	if in.Name != nil {
		updates["name"] = strings.TrimSpace(*in.Name)
	}
	if in.Email != nil {
		updates["email"] = strings.TrimSpace(*in.Email)
	}
	if in.Titles != nil {
		updates["titles"] = strings.TrimSpace(*in.Titles)
	}
	if in.Initials != nil {
		updates["initials"] = strings.TrimSpace(*in.Initials)
	}
	if len(updates) == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "No changes"})
	}

	if err := db.DB.Model(&models.Manager{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Update failed"})
	}
	return c.JSON(fiber.Map{"message": "Updated"})
}

// DELETE /api/admin/data/managers/:id
// Optional body: { "reassignTo": "uuid" } to reassign owned associations before delete
func DeleteManager(c *fiber.Ctx) error {
	id := c.Params("id")

	var owned int64
	if err := db.DB.Model(&models.Association{}).
		Where("manager_id = ?", id).
		Count(&owned).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Count failed"})
	}

	var in struct{ ReassignTo *string `json:"reassignTo"` }
	_ = c.BodyParser(&in)

	// If manager owns associations, require reassignment (RESTRICT semantics)
	if owned > 0 && (in.ReassignTo == nil || *in.ReassignTo == "") {
		return c.Status(http.StatusConflict).JSON(fiber.Map{
			"error": "Manager has associations; provide reassignTo",
			"owned": owned,
		})
	}

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		if owned > 0 {
			// Validate target manager
			var target models.Manager
			if err := tx.First(&target, "id = ?", *in.ReassignTo).Error; err != nil {
				return fiber.NewError(http.StatusBadRequest, "reassignTo manager not found")
			}
			// Reassign
			if err := tx.Model(&models.Association{}).
				Where("manager_id = ?", id).
				Update("manager_id", *in.ReassignTo).Error; err != nil {
				return fiber.NewError(http.StatusInternalServerError, "Reassign failed")
			}
		}
		// Delete original manager
		if err := tx.Delete(&models.Manager{}, "id = ?", id).Error; err != nil {
			return fiber.NewError(http.StatusInternalServerError, "Delete failed")
		}
		return nil
	})
	if err != nil {
		fe, ok := err.(*fiber.Error)
		if ok {
			return c.Status(fe.Code).JSON(fiber.Map{"error": fe.Message})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Transaction failed"})
	}

	return c.JSON(fiber.Map{"message": "Deleted"})
}
