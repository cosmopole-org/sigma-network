package outputs_spaces

import (
	"sigma/sigverse/model"
)

type CreateOutput struct {
	Space  model.Space  `json:"space"`
	Member model.Member `json:"member"`
}
