package inputs_interact

type SendFriendRequestDto struct {
	Code string `json:"code" validate:"required"`
}

func (d SendFriendRequestDto) GetSpaceId() string {
	return ""
}

func (d SendFriendRequestDto) GetTopicId() string {
	return ""
}

func (d SendFriendRequestDto) GetMemberId() string {
	return ""
}
