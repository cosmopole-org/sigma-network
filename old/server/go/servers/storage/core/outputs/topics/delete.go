package outputs_topics

import "sigma/storage/core/models"

type DeleteOutput struct {
	Topic models.Topic `json:"topic"`
}
