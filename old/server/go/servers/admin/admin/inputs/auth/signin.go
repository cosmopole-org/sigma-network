package inputs_auth

type SigninDto struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func (d SigninDto) GetData() any {
	return "dummy"
}

func (d SigninDto) GetSpaceId() string {
	return ""
}

func (d SigninDto) GetTopicId() string {
	return ""
}

func (d SigninDto) GetMemberId() string {
	return ""
}
