package outputs_invites

import "sigma/main/core/models"

type AcceptOutput struct {
	Member models.Member `json:"member"`
}
