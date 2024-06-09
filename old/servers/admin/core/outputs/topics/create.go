package outputs_topics

import "sigma/admin/core/models"

type CreateOutput struct {
	Topic models.Topic `json:"topic"`
}
