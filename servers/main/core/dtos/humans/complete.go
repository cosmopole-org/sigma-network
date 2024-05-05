package dtos_humans

type CompleteDto struct {
	VerifyCode string `json:"verifyCode" validate:"required"`
	ClientCode string `json:"clientCode" validate:"required"`
	FirstName  string `json:"firstName" validate:"required"`
	LastName   string `json:"lastName"`
}

func (d CompleteDto) GetData() any {
	return "dummy"
}

func (d CompleteDto) GetTowerId() int64 {
	return 0
}

func (d CompleteDto) GetRoomId() int64 {
	return 0
}
