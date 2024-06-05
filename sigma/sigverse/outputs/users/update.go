package outputs_users

import (
	models "sigma/sigverse/model"
)

type UpdateOutput struct {
	User models.PublicUser `json:"user"`
}
