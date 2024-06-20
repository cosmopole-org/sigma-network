package outputs_users

import (
	models "sigma/sigverse/model"
)

type AuthenticateOutput struct {
	Authenticated bool              `json:"authenticated"`
	User          models.PublicUser `json:"user"`
}
