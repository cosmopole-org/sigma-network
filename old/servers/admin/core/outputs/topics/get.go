package outputs_topics

import "sigma/admin/core/models"

type GetOutput struct {
	Topic models.Topic `json:"topic"`
}
