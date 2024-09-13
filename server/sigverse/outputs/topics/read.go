package outputs_topics

import (
	models "sigma/sigverse/model"
)

type ReadOutput struct {
	Topics []models.Topic `json:"topics"`
}
