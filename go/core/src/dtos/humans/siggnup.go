package dtos_humans

type SignupDto struct {
	Email string `json:"email" validate:"required"`
}

type IsignupDto interface {
	GetData() any
}

func (d SignupDto) GetData() any {
	return "dummy"
}
