package outputs

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

type CreateGameOutput struct {
	Players []models.Player `json:"players"`
	Hakem   string          `json:"hakem"`
}

type SpecifyHokmOutput struct {
	Message string `json:"message"`
}

type PlayGameOutput struct {
	Message string `json:"message"`
}
