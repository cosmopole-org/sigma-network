package outputs_topics

import "sigma/main/core/models"

type DeleteOutput struct {
	Topic models.Topic `json:"topic"`
}
