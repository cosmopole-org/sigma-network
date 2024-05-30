package outputs_invites

import "sigma/storage/core/models"

type CreateOutput struct {
	Invite models.Invite `json:"invite"`
}