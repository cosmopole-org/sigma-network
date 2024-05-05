package dtos_towers

type DeleteDto struct {
	TowerId  int64  `json:"towerId" validate:"required"`
}

func (d DeleteDto) GetData() any {
	return "dummy"
}

func (d DeleteDto) GetTowerId() int64 {
	return 0
}

func (d DeleteDto) GetRoomId() int64 {
	return 0
}
