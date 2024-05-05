package dtos_invites

type DeclineDto struct {
	InviteId  int64  `json:"inviteId" validate:"required"`
}

func (d DeclineDto) GetData() any {
	return "dummy"
}

func (d DeclineDto) GetTowerId() int64 {
	return 0
}

func (d DeclineDto) GetRoomId() int64 {
	return 0
}
