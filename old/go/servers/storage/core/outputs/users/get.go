package outputs_users

import "sigma/storage/core/models"

type GetOutput struct {
	User models.User `json:"User"`
}
