package core

import (
	"sigma/main/core/modules"
	"sigma/main/core/services"

	"google.golang.org/grpc"
)

func LoadCoreServices(coreAccess bool) {
	services.CreateDummyService(modules.GetApp(), coreAccess)
	services.CreateAuthService(modules.GetApp(), coreAccess)
	services.CreateHumanService(modules.GetApp(), coreAccess)
	services.CreateInviteService(modules.GetApp(), coreAccess)
	services.CreateTowerService(modules.GetApp(), coreAccess)
	services.CreateRoomService(modules.GetApp(), coreAccess)
	services.CreateMachineService(modules.GetApp(), coreAccess)
	services.CreateWorkerService(modules.GetApp(), coreAccess)
}

func LoadCoreGrpcServices(gs *grpc.Server) {
	services.LoadAuthGrpcService(gs)
	services.LoadHumanGrpcService(gs)
	services.LoadInviteGrpcService(gs)
	services.LoadTowerGrpcService(gs)
	services.LoadRoomGrpcService(gs)
	services.LoadMachineGrpcService(gs)
	services.LoadWorkerGrpcService(gs)
}
