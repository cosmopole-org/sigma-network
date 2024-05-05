package dtos_humans

type UpdateDto struct {
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}

func (d UpdateDto) GetTowerId() int64 {
	return 0
}

func (d UpdateDto) GetRoomId() int64 {
	return 0
}
