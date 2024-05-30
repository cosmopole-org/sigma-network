package inputs_auth

type GetServersMapInput struct{}

func (d GetServersMapInput) GetData() any {
	return "dummy"
}

func (d GetServersMapInput) GetSpaceId() string {
	return ""
}

func (d GetServersMapInput) GetTopicId() string {
	return ""
}

func (d GetServersMapInput) GetMemberId() string {
	return ""
}
