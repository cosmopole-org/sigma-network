package outputs_topics

import "sigma/main/core/models"

type GetOutput struct {
	Topic models.Topic `json:"topic"`
}
