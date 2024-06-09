package outputs_users

import "sigma/admin/core/models"

type UpdateOutput struct {
	User models.PublicUser `json:"user"`
}
