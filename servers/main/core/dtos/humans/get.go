package dtos_humans

type GetDto struct {
	UserId int64 `json:"userId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}

func (d GetDto) GetTowerId() int64 {
	return 0
}

func (d GetDto) GetRoomId() int64 {
	return 0
}
