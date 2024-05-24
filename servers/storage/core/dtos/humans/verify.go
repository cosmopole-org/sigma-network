package dtos_humans

type VerifyDto struct {
	VerifyCode string `json:"verifyCode" validate:"required"`
	ClientCode string `json:"clientCode" validate:"required"`
}

func (d VerifyDto) GetData() any {
	return "dummy"
}

func (d VerifyDto) GetTowerId() int64 {
	return 0
}

func (d VerifyDto) GetRoomId() int64 {
	return 0
}

func (d VerifyDto) GetWorkerId() int64 {
	return 0
}
