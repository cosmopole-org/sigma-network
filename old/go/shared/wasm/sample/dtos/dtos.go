package dtos

type HelloInput struct {
	Name string `json:"name"`
}

type HelloOutput struct {
	Message string `json:"message"`
}

type ByeInput struct{}

type ByeOutput struct {
	Message string `json:"message"`
}
