package services

import (
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
)

func CreateTowerService(app *interfaces.IApp) interfaces.IService {
	return types.CreateService("towers")
}
