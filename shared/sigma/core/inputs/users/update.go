package inputs_users

type UpdateInput struct {
	Name     string `json:"name" validate:"required"`
	Avatar   string `json:"avatar" validate:"required"`
	Metadata string `json:"metadata" validate:"required"`
}

func (d UpdateInput) GetData() any {
	return "dummy"
}

func (d UpdateInput) GetSpaceId() string {
	return ""
}

func (d UpdateInput) GetTopicId() string {
	return ""
}

func (d UpdateInput) GetMemberId() string {
	return ""
}
