package outputs_spaces

import "sigma/storage/core/models"

type DeleteOutput struct {
	Space models.Space `json:"space"`
}
