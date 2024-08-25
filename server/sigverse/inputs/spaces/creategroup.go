package inputs_spaces

type CreateGroupInput struct {
	Name string `json:"name" validate:"required"`
}

func (d CreateGroupInput) GetSpaceId() string {
	return ""
}

func (d CreateGroupInput) GetTopicId() string {
	return ""
}

func (d CreateGroupInput) GetMemberId() string {
	return ""
}
