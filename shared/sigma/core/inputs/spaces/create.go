package inputs_spaces

type CreateInput struct {
	Title    string `json:"title" validate:"required"`
	Avatar   string `json:"avatar"`
	IsPublic bool   `json:"isPublic"`
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
