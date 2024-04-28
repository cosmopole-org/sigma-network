package utils

import (
	"sigma/map/core/models"
)

func BuildErrorJson(message string) models.Error {
	return models.Error{Message: message}
}
