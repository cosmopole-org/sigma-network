package cosmopole_outputs_messenger

import cosmopole_models "sigma/core/cosmopole/models"

type ReadOutput struct {
	Messages []cosmopole_models.Message `json:"messages"`
}
