package outputs_users

import "sigma/storage/core/models"

type UpdateOutput struct {
	User models.PublicUser `json:"user"`
}
