package dtos_humans

type VerifyDto struct {
	VerifyCode string `json:"verifyCode" validate:"required"`
	ClientCode string `json:"clientCode" validate:"required"`
}

func (d VerifyDto) GetData() any {
	return "dummy"
}
