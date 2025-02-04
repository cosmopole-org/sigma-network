package admin_outputs_player

type GetOutput struct{
	Data map[string]any `json:"data" validate:"required"`
}
