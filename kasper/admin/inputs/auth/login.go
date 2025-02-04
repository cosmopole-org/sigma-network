package admin_inputs_auth

type LoginInput struct {
	EmailToken   *string `json:"emailToken"`
	SessionToken *string `json:"sessionToken"`
}

func (d LoginInput) GetSpaceId() string {
	return ""
}

func (d LoginInput) GetTopicId() string {
	return ""
}

func (d LoginInput) GetMemberId() string {
	return ""
}
