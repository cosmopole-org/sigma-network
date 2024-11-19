package inputs_spaces

type RemoveMemberInput struct {
	MemberId string `json:"memberId" validate:"required"`
	SpaceId  string `json:"spaceId" validate:"required"`
	TopicId  string `json:"topicId"`
}

func (d RemoveMemberInput) GetData() any {
	return "dummy"
}

func (d RemoveMemberInput) GetSpaceId() string {
	return d.SpaceId
}

func (d RemoveMemberInput) GetTopicId() string {
	return ""
}

func (d RemoveMemberInput) GetMemberId() string {
	return ""
}
