package outputs_invites

import (
	models "sigma/sigverse/model"
)

type CreateOutput struct {
	Invite models.Invite `json:"invite"`
}
