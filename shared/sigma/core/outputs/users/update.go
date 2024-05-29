package outputs_users

import "sigma/main/core/models"

type UpdateOutput struct {
	User models.User `json:"user"`
}
