package outputs_spaces

import "sigma/admin/core/models"

type GetOutput struct {
	Space models.Space `json:"space"`
}
