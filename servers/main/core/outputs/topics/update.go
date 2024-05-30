package outputs_topics

import "sigma/main/core/models"

type UpdateOutput struct {
	Topic models.Topic `json:"topic"`
}
