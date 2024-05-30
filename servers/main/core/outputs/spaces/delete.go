package outputs_spaces

import "sigma/main/core/models"

type DeleteOutput struct {
	Space models.Space `json:"space"`
}
