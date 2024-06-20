package outputs_spaces

import "sigma/storage/core/models"

type CreateOutput struct {
	Space  models.Space  `json:"space"`
	Member models.Member `json:"member"`
}
