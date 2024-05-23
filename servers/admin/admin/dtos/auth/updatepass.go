package dtos_auth

type UpdatePassDto struct {
	Password string `json:"password" validate:"required"`
}

func (d UpdatePassDto) GetData() any {
	return "dummy"
}

func (d UpdatePassDto) GetTowerId() int64 {
	return 0
}

func (d UpdatePassDto) GetRoomId() int64 {
	return 0
}

func (d UpdatePassDto) GetWorkerId() int64 {
	return 0
}
