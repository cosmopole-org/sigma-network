package outputs_users

import "sigma/storage/core/models"

type CreateOutput struct {
	User    models.User    `json:"user"`
	Session models.Session `json:"session"`
}
