package inputs_spaces

type CreatePrivateInput struct {
	ParticipantId string `json:"participantId" validate:"required"`
}

func (d CreatePrivateInput) GetSpaceId() string {
	return ""
}

func (d CreatePrivateInput) GetTopicId() string {
	return ""
}

func (d CreatePrivateInput) GetMemberId() string {
	return ""
}
