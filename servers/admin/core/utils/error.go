package utils

import (
	"sigma/admin/core/models"
)

func BuildErrorJson(message string) models.Error {
	return models.Error{Message: message}
}
