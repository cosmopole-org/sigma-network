package outputs_users

import "sigma/main/core/models"

type GetOutput struct {
	User models.User `json:"User"`
}
