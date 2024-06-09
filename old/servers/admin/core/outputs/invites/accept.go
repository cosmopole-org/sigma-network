package outputs_invites

import "sigma/admin/core/models"

type AcceptOutput struct {
	Member models.Member `json:"member"`
}
