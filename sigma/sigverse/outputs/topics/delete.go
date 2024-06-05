package outputs_topics

import (
	models "sigma/sigverse/model"
)

type DeleteOutput struct {
	Topic models.Topic `json:"topic"`
}
