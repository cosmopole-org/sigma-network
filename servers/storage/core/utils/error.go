package utils

import (
	"sigma/main/core/models"
)

func BuildErrorJson(message string) models.Error {
	return models.Error{Message: message}
}
