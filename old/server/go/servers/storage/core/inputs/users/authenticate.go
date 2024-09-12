package inputs_users

type AuthenticateInput struct{}

func (d AuthenticateInput) GetData() any {
	return "dummy"
}

func (d AuthenticateInput) GetSpaceId() string {
	return ""
}

func (d AuthenticateInput) GetTopicId() string {
	return ""
}

func (d AuthenticateInput) GetMemberId() string {
	return ""
}
