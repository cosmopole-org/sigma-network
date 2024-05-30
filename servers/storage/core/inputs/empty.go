package inputs

type EmptyInput struct {
}

func (d EmptyInput) GetData() any {
	return "dummy"
}

func (d EmptyInput) GetSpaceId() string {
	return ""
}

func (d EmptyInput) GetTopicId() string {
	return ""
}

func (d EmptyInput) GetMemberId() string {
	return ""
}
