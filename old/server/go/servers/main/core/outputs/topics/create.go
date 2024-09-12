package outputs_topics

import "sigma/main/core/models"

type CreateOutput struct {
	Topic models.Topic `json:"topic"`
}
