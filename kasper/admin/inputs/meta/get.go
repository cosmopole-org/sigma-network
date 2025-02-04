package admin_inputs_meta

type GetInput struct {
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
