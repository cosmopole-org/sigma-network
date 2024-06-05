package outputs_spaces

import (
	models "sigma/sigverse/model"
)

type GetOutput struct {
	Space models.Space `json:"space"`
}
