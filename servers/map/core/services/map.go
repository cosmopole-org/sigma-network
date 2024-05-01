package services

import (
	"sigma/map/core/dtos"
	pb "sigma/map/core/grpc"
	"sigma/map/core/modules"
	"sigma/map/core/outputs"
)

func getServersMap(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	return &outputs.Servers{
		Map: map[string]pb.Server{
			"cosmopole": {
				Host: "localhost",
				Port: 8080,
			},
		},
	}, nil
}

func CreateMapService(app *modules.App) *modules.Service {
	var s = modules.CreateService(app, "map")
	s.AddMethod(modules.CreateMethod("get", getServersMap, modules.CreateCheck(false, false, false), dtos.ServersDto{}, modules.CreateMethodOptions(true, false)))
	return s
}
