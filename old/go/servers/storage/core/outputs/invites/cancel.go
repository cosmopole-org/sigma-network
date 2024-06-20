package outputs_invites

import "sigma/storage/core/models"

type CancelOutput struct {
	Invite models.Invite `json:"invite"`
}
