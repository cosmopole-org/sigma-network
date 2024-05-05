package dtos_towers

type JoinDto struct {
	TowerId int64 `json:"towerId" validate:"required"`
}

func (d JoinDto) GetData() any {
	return "dummy"
}

func (d JoinDto) GetTowerId() int64 {
	return d.TowerId
}

func (d JoinDto) GetRoomId() int64 {
	return 0
}
