package admin_inputs_board

type KickoutInput struct {
	UserId  string `json:"userId" validate:"required"`
	GameKey string `json:"gameKey" validate:"required"`
	Level   string `json:"level" validate:"required"`
}

func (d KickoutInput) GetSpaceId() string {
	return ""
}

func (d KickoutInput) GetTopicId() string {
	return ""
}

func (d KickoutInput) GetMemberId() string {
	return ""
}
