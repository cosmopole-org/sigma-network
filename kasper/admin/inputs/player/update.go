package admin_inputs_player

type UpdateInput struct {
	UserId  string         `json:"userId" validate:"required"`
	GameKey string         `json:"gameKey" validate:"required"`
	Data    map[string]any `json:"data" validate:"required"`
}

func (d UpdateInput) GetSpaceId() string {
	return ""
}

func (d UpdateInput) GetTopicId() string {
	return ""
}

func (d UpdateInput) GetMemberId() string {
	return ""
}
