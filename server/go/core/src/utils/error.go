package utils

import (
	"sigma/core/src/models"
)

func BuildErrorJson(message string) models.Error {
	return models.Error{Message: message}
}
