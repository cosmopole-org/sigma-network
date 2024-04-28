package dtos_humans

type GetDto struct {
	UserId string `json:"userId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}
