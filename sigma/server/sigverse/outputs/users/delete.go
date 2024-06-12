package outputs_users

import (
	models "sigma/sigverse/model"
)

type DeleteOutput struct {
	User models.User `json:"user"`
}
