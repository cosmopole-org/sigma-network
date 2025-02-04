package outputs_invites

import (
	models "sigma/sigverse/model"
)

type AcceptOutput struct {
	Member models.Member `json:"member"`
}
