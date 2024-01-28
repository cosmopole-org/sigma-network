package cosmopole_dtos_messenger

type CreateDto struct {
	Data string `json:"data" validate:"required"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}
