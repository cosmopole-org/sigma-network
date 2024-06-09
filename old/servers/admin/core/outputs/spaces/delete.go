package outputs_spaces

import "sigma/admin/core/models"

type DeleteOutput struct {
	Space models.Space `json:"space"`
}
