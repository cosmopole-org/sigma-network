package inputs

type PingInput struct {
}

func (d PingInput) GetData() any {
	return "dummy"
}

func (d PingInput) GetSpaceId() string {
	return ""
}

func (d PingInput) GetTopicId() string {
	return ""
}

func (d PingInput) GetMemberId() string {
	return ""
}
