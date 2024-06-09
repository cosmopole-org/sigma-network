package outputs_users

import "sigma/admin/core/models"

type DeleteOutput struct {
	User models.User `json:"user"`
}
