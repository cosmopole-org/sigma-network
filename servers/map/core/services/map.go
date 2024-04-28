package services

import (
	"sigma/map/core/dtos"
	"sigma/map/core/interfaces"
	"sigma/map/core/outputs"
	"sigma/map/core/types"
)

func getServersMap(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	return &outputs.Servers{
		Map: map[string]string{
			"cosmopole": "http://localhost:8080",
		},
	}, nil
}

func CreateMapService(app interfaces.IApp) interfaces.IService {
	var s = types.CreateService(app, "map")
	s.AddMethod(types.CreateMethod("get", getServersMap, types.CreateCheck(false, false, false), dtos.ServersDto{}, types.CreateMethodOptions(true, false)))
	return s
}
