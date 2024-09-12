package outputs_topics

import "sigma/admin/core/models"

type UpdateOutput struct {
	Topic models.Topic `json:"topic"`
}
