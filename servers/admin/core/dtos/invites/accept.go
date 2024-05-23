package dtos_invites

type AcceptDto struct {
	InviteId int64 `json:"inviteId" validate:"required"`
}

func (d AcceptDto) GetData() any {
	return "dummy"
}

func (d AcceptDto) GetTowerId() int64 {
	return 0
}

func (d AcceptDto) GetRoomId() int64 {
	return 0
}

func (d AcceptDto) GetWorkerId() int64 {
	return 0
}
