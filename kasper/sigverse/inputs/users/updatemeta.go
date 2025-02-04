package inputs_users

type UpdateMetaInput struct {
	Data map[string]any `json:"data" validate:"required"`
}

func (d UpdateMetaInput) GetSpaceId() string {
	return ""
}

func (d UpdateMetaInput) GetTopicId() string {
	return ""
}

func (d UpdateMetaInput) GetMemberId() string {
	return ""
}
