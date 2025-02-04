package inputs_interact

type UnfriendUserDto struct {
	UserId string `json:"userId" validate:"required"`
}

func (d UnfriendUserDto) GetSpaceId() string {
	return ""
}

func (d UnfriendUserDto) GetTopicId() string {
	return ""
}

func (d UnfriendUserDto) GetMemberId() string {
	return ""
}
