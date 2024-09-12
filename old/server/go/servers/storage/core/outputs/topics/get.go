package outputs_topics

import "sigma/storage/core/models"

type GetOutput struct {
	Topic models.Topic `json:"topic"`
}
