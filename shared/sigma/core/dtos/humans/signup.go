package dtos_humans

type SignupDto struct {
	Email string `json:"email" validate:"required"`
}

func (d SignupDto) GetData() any {
	return "dummy"
}

func (d SignupDto) GetTowerId() int64 {
	return 0
}

func (d SignupDto) GetRoomId() int64 {
	return 0
}

func (d SignupDto) GetWorkerId() int64 {
	return 0
}
