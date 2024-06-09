package outputs_users

import "sigma/storage/core/models"

type AuthenticateOutput struct {
	Authenticated bool        `json:"authenticated"`
	User          models.User `json:"user"`
}
