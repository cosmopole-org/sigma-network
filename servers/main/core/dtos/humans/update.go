package dtos_humans

type UpdateDto struct {
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}
