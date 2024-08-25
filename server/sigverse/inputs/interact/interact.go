package inputs_interact

type InteractDto struct {
	UserId string `json:"userId" validate:"required"`
}

func (d InteractDto) GetSpaceId() string {
	return ""
}

func (d InteractDto) GetTopicId() string {
	return ""
}

func (d InteractDto) GetMemberId() string {
	return ""
}
