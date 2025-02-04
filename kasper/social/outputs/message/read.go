package outputs_message

import models "sigma/social/model"

type ReadMessagesOutput struct {
	Messages []models.ResultMessage `json:"messages"`
}
