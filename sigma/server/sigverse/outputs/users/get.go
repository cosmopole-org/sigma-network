package outputs_users

import (
	models "sigma/sigverse/model"
)

type GetOutput struct {
	User models.User `json:"User"`
}
