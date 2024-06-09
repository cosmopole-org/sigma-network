package inputs_users

type DeleteInput struct{}

func (d DeleteInput) GetData() any {
	return "dummy"
}

func (d DeleteInput) GetSpaceId() string {
	return ""
}

func (d DeleteInput) GetTopicId() string {
	return ""
}

func (d DeleteInput) GetMemberId() string {
	return ""
}
