package outputs_invites

import "sigma/storage/core/models"

type AcceptOutput struct {
	Member models.Member `json:"member"`
}
