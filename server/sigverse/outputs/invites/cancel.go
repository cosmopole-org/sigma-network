package outputs_invites

import (
	models "sigma/sigverse/model"
)

type CancelOutput struct {
	Invite models.Invite `json:"invite"`
}
