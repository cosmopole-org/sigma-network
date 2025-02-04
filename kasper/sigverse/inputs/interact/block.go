package inputs_interact

type BlockDto struct {
	UserId string `json:"userId" validate:"required"`
}

func (d BlockDto) GetSpaceId() string {
	return ""
}

func (d BlockDto) GetTopicId() string {
	return ""
}

func (d BlockDto) GetMemberId() string {
	return ""
}
