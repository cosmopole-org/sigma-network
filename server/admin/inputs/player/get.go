package admin_inputs_player

type GetInput struct {
	UserId  string `json:"userId" validate:"required"`
	GameKey string `json:"gameKey" validate:"required"`
}

func (d GetInput) GetSpaceId() string {
	return ""
}

func (d GetInput) GetTopicId() string {
	return ""
}

func (d GetInput) GetMemberId() string {
	return ""
}
