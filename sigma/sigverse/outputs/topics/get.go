package outputs_topics

import (
	models "sigma/sigverse/model"
)

type GetOutput struct {
	Topic models.Topic `json:"topic"`
}
