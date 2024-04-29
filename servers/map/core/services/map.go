package services

import (
	"sigma/map/core/dtos"
	"sigma/map/core/outputs"
	"sigma/map/core/types"
	"sigma/map/core/models"
)

func getServersMap(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	return &outputs.Servers{
		Map: map[string]models.Server{
			"cosmopole": {
				Host: "localhost",
				Port: 8080,
			},
		},
	}, nil
}

func CreateMapService(app *types.App) *types.Service {
	var s = types.CreateService(app, "map")
	s.AddMethod(types.CreateMethod("get", getServersMap, types.CreateCheck(false, false, false), dtos.ServersDto{}, types.CreateMethodOptions(true, false)))
	return s
}
