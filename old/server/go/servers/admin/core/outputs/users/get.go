package outputs_users

import "sigma/admin/core/models"

type GetOutput struct {
	User models.User `json:"User"`
}
