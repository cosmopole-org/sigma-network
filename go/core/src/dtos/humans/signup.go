package dtos_humans

type SignupDto struct {
	Email string `json:"email" validate:"required"`
}

func (d SignupDto) GetData() any {
	return "dummy"
}
