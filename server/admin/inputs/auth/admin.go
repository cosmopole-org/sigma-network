package admin_inputs_auth

type AdminInput struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func (d AdminInput) GetSpaceId() string {
	return ""
}

func (d AdminInput) GetTopicId() string {
	return ""
}

func (d AdminInput) GetMemberId() string {
	return ""
}
