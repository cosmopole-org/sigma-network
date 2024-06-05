package inputs_spaces

type CreateInput struct {
	Tag      string `json:"tag" validate:"required"`
	Title    string `json:"title" validate:"required"`
	Avatar   string `json:"avatar" validate:"required"`
	IsPublic bool   `json:"isPublic" validate:"required"`
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
