package admin_outputs_auth

type LoginOutput struct {
	Token string `json:"token"`
}

func (d LoginOutput) GetSpaceId() string {
	return ""
}

func (d LoginOutput) GetTopicId() string {
	return ""
}

func (d LoginOutput) GetMemberId() string {
	return ""
}
