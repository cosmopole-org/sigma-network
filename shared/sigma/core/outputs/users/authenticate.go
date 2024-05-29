package outputs_users

import "sigma/main/core/models"

type AuthenticateOutput struct {
	User models.User `json:"user"`
}
