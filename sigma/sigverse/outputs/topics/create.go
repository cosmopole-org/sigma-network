package outputs_topics

import (
	models "sigma/sigverse/model"
)

type CreateOutput struct {
	Topic models.Topic `json:"topic"`
}
