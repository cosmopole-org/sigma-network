package inputs_interact

type GetByCodeDto struct {
	Code string `json:"code" validate:"required"`
}

func (d GetByCodeDto) GetSpaceId() string {
	return ""
}

func (d GetByCodeDto) GetTopicId() string {
	return ""
}

func (d GetByCodeDto) GetMemberId() string {
	return ""
}
