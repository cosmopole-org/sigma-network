package outputs_spaces

import "sigma/admin/core/models"

type AddMemberOutput struct {
	Member models.Member `json:"member"`
}
