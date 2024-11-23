package inputs_spaces

type UpdateMemberInput struct {
	MemberId string `json:"memberId" validate:"required"`
	SpaceId  string `json:"spaceId" validate:"required"`
	TopicId  string `json:"topicId"`
	Metadata string `json:"metadata" validate:"required"`
}

func (d UpdateMemberInput) GetData() any {
	return "dummy"
}

func (d UpdateMemberInput) GetSpaceId() string {
	return d.SpaceId
}

func (d UpdateMemberInput) GetTopicId() string {
	return d.TopicId
}

func (d UpdateMemberInput) GetMemberId() string {
	return ""
}
