package outputs_spaces

import (
	models "sigma/sigverse/model"
)

type AddMemberOutput struct {
	Member models.Member `json:"member"`
}
