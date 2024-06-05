package outputs_spaces

import (
	models "sigma/sigverse/model"
)

type UpdateOutput struct {
	Space models.Space `json:"space"`
}
