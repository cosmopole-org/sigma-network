package inputs_auth

type UpdatePassDto struct {
	Password string `json:"password" validate:"required"`
}

func (d UpdatePassDto) GetData() any {
	return "dummy"
}

func (d UpdatePassDto) GetSpaceId() string {
	return ""
}

func (d UpdatePassDto) GetTopicId() string {
	return ""
}

func (d UpdatePassDto) GetMemberId() string {
	return ""
}
