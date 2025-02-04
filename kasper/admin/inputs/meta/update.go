package admin_inputs_meta

type UpdateInput struct {
	Data map[string]any `json:"data" validate:"required"`
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
