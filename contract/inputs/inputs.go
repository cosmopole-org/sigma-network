package inputs

import "games/hokm/models"

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

// game

type CreateGameInput struct {
	Players []models.Player `json:"players"`
}

type SpecifyHokmInput struct {
	Hokm    string `json:"hokm"`
}

type PlayGameInput struct {
	Action  string `json:"action"`
}
