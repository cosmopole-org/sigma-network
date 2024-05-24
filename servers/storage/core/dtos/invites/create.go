package dtos_invites

type CreateDto struct {
	HumanId         int64  `json:"humanId" validate:"required"`
	TowerId         int64  `json:"towerId" validate:"required"`
	RecepientOrigin string `json:"recepientOrigin" validate:"required"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}

func (d CreateDto) GetTowerId() int64 {
	return d.TowerId
}

func (d CreateDto) GetRoomId() int64 {
	return 0
}

func (d CreateDto) GetWorkerId() int64 {
	return 0
}