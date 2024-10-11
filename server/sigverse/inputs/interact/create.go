package inputs_interact

type CreateDto struct {
	UserId string `json:"userId" validate:"required"`
}

func (d CreateDto) GetSpaceId() string {
	return ""
}

func (d CreateDto) GetTopicId() string {
	return ""
}

func (d CreateDto) GetMemberId() string {
	return ""
}
