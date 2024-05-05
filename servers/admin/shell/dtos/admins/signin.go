package dtos_admins

type SigninDto struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func (d SigninDto) GetData() any {
	return "dummy"
}

func (d SigninDto) GetTowerId() int64 {
	return 0
}

func (d SigninDto) GetRoomId() int64 {
	return 0
}