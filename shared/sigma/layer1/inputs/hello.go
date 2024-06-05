package inputs

type HelloInput struct{}

func (d HelloInput) GetData() any {
	return "dummy"
}

func (d HelloInput) GetSpaceId() string {
	return ""
}

func (d HelloInput) GetTopicId() string {
	return ""
}

func (d HelloInput) GetMemberId() string {
	return ""
}
