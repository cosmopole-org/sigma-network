package outputs_spaces

import "sigma/admin/core/models"

type CreateOutput struct {
	Space  models.Space  `json:"space"`
	Member models.Member `json:"member"`
}
