package admin_inputs_auth

type ChangePassInput struct {
	Password string `json:"password" validate:"required"`
}

func (d ChangePassInput) GetSpaceId() string {
	return ""
}

func (d ChangePassInput) GetTopicId() string {
	return ""
}

func (d ChangePassInput) GetMemberId() string {
	return ""
}
