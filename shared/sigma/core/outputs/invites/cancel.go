package outputs_invites

import "sigma/main/core/models"

type CancelOutput struct {
	Invite models.Invite `json:"invite"`
}
