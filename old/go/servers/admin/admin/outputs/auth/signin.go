package outputs_auth

type SigninOutput struct {
	Token string `json:"token" validate:"required"`
}

func (d SigninOutput) GetData() any {
	return "dummy"
}

func (d SigninOutput) GetTowerId() int64 {
	return 0
}

func (d SigninOutput) GetRoomId() int64 {
	return 0
}

func (d SigninOutput) GetWorkerId() int64 {
	return 0
}
