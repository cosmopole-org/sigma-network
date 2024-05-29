package outputs_invites

import "sigma/main/core/models"

type CreateOutput struct {
	Invite models.Invite `json:"invite"`
}