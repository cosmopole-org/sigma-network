package core

import (
	"sigma/main/core/modules"
	"sigma/main/core/services"

	"google.golang.org/grpc"
)

func Connector[T modules.IDto]() {

}

func LoadCoreServices(a *modules.App, coreAccess bool) {
	services.CreateDummyService(a, coreAccess)
	services.CreateAuthService(a, coreAccess)
	services.CreateHumanService(a, coreAccess)
	services.CreateInviteService(a, coreAccess)
	services.CreateTowerService(a, coreAccess)
	services.CreateRoomService(a, coreAccess)
	services.CreateMachineService(a, coreAccess)
	services.CreateWorkerService(a, coreAccess)
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
