package inputs_spaces

type UpdateInput struct {
	SpaceId  string `json:"spaceId" validate:"required"`
	Tag      string `json:"tag" validate:"required"`
	Title    string `json:"title" validate:"required"`
	Avatar   string `json:"avatar" validate:"required"`
	IsPublic bool   `json:"isPublic"`
}

func (d UpdateInput) GetData() any {
	return "dummy"
}

func (d UpdateInput) GetSpaceId() string {
	return d.SpaceId
}

func (d UpdateInput) GetTopicId() string {
	return ""
}

func (d UpdateInput) GetMemberId() string {
	return ""
}
