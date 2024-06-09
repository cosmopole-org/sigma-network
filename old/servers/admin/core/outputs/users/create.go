package outputs_users

import "sigma/admin/core/models"

type CreateOutput struct {
	User    models.User    `json:"user"`
	Session models.Session `json:"session"`
}
