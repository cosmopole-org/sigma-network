package outputs_users

import (
	models "sigma/sigverse/model"
)

type GetOutput struct {
	User models.PublicUser `json:"user"`
}
