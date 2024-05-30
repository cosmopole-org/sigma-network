package updates_topics

import "sigma/main/core/models"

type Send struct {
	User   models.User  `json:"user"`
	Topic  models.Topic `json:"topic"`
	Action string       `json:"action"`
	Data   string       `json:"data"`
}
