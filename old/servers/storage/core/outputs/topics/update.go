package outputs_topics

import "sigma/storage/core/models"

type UpdateOutput struct {
	Topic models.Topic `json:"topic"`
}
