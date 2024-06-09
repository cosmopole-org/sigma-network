package outputs_topics

import "sigma/admin/core/models"

type DeleteOutput struct {
	Topic models.Topic `json:"topic"`
}
