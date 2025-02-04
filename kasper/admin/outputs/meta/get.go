package admin_outputs_meta

type GetOutput struct{
	Data map[string]any `json:"data" validate:"required"`
}
