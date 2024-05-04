package dtos_humans

type GetDto struct {
	UserId int64 `json:"userId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}
