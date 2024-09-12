package outputs_topics

import "sigma/storage/core/models"

type CreateOutput struct {
	Topic models.Topic `json:"topic"`
}
