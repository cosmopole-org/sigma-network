package inputs_users

type CreateInput struct {
	Username  string `json:"username" validate:"required"`
	Secret    string `json:"secret" validate:"required"`
	Name      string `json:"name" validate:"required"`
	Avatar    string `json:"avatar" validate:"required"`
	PublicKey string `json:"publicKey" validate:"required"`
	Typ       string `json:"type"`
}

func (d CreateInput) GetData() any {
	return "dummy"
}

func (d CreateInput) GetSpaceId() string {
	return ""
}

func (d CreateInput) GetTopicId() string {
	return ""
}

func (d CreateInput) GetMemberId() string {
	return ""
}
