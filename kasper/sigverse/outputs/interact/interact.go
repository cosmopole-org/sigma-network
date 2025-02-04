package outputs_interact

import model "sigma/sigverse/model"

type InteractOutput struct {
	Interaction model.Interaction `json:"interaction"`
	Space       *model.Space      `json:"space"`
	Topic       *model.Topic      `json:"topic"`
	Member      *model.Member     `json:"member"`
}
