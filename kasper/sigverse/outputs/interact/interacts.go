package outputs_interact

import models "sigma/sigverse/model"

type InteractsOutput struct {
	Interactions []*models.PreparedInteraction `json:"interactions"`
}
