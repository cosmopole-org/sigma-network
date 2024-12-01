package outputs_spaces

import (
	models "sigma/sigverse/model"
)

type ReadOutput struct {
	Spaces []models.Space `json:"spaces"`
}
