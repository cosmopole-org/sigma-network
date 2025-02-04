package admin_inputs_player

type ListInput struct {
	GameKey string `json:"gameKey" validate:"required"`
	Offset  string `json:"offset" validate:"required"`
	Count   string `json:"count" validate:"required"`
	Query   string `json:"query"`
}

func (d ListInput) GetSpaceId() string {
	return ""
}

func (d ListInput) GetTopicId() string {
	return ""
}

func (d ListInput) GetMemberId() string {
	return ""
}
