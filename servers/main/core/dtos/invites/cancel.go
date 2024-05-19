package dtos_invites

type CancelDto struct {
	InviteId  int64  `json:"inviteId" validate:"required"`
	TowerId int64 `json:"towerId" validate:"required"`
}

func (d CancelDto) GetData() any {
	return "dummy"
}

func (d CancelDto) GetTowerId() int64 {
	return d.TowerId
}

func (d CancelDto) GetRoomId() int64 {
	return 0
}

func (d CancelDto) GetWorkerId() int64 {
	return 0
}
