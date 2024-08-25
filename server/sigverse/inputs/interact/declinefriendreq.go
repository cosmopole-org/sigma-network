package inputs_interact

type DeclineFriendRequestDto struct {
	UserId string `json:"userId" validate:"required"`
}

func (d DeclineFriendRequestDto) GetSpaceId() string {
	return ""
}

func (d DeclineFriendRequestDto) GetTopicId() string {
	return ""
}

func (d DeclineFriendRequestDto) GetMemberId() string {
	return ""
}
