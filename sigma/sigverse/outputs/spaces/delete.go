package outputs_spaces

import (
	models "sigma/sigverse/model"
)

type DeleteOutput struct {
	Space models.Space `json:"space"`
}
