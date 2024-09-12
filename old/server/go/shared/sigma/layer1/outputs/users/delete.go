package outputs_users

import "sigma/main/core/models"

type DeleteOutput struct {
	User models.User `json:"user"`
}
