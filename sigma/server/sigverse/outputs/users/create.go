package outputs_users

import (
	"sigma/sigverse/model"
)

type CreateOutput struct {
	User    model.User    `json:"user"`
	Session model.Session `json:"session"`
}
