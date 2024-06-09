package outputs_invites

import "sigma/admin/core/models"

type CancelOutput struct {
	Invite models.Invite `json:"invite"`
}
