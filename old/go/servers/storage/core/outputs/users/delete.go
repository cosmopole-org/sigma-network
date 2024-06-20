package outputs_users

import "sigma/storage/core/models"

type DeleteOutput struct {
	User models.User `json:"user"`
}
