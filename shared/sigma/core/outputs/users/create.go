package outputs_users

import "sigma/main/core/models"

type CreateOutput struct {
	User models.User `json:"user"`
}
