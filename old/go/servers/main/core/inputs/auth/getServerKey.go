package inputs_auth

type GetServerKeyInput struct{}

func (d GetServerKeyInput) GetData() any {
	return "dummy"
}

func (d GetServerKeyInput) GetSpaceId() string {
	return ""
}

func (d GetServerKeyInput) GetTopicId() string {
	return ""
}

func (d GetServerKeyInput) GetMemberId() string {
	return ""
}
