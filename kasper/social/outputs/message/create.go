package outputs_message

import models "sigma/social/model"

type CreateMessageOutput struct {
	Message models.Message `json:"message"`
}
