package outputs_topics

import (
	models "sigma/sigverse/model"
)

type UpdateOutput struct {
	Topic models.Topic `json:"topic"`
}
