package outputs_invites

import "sigma/admin/core/models"

type CreateOutput struct {
	Invite models.Invite `json:"invite"`
}