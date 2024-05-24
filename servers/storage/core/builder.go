package builder

import (
	"sigma/storage/core/modules"
	"sigma/storage/core/services"

	"google.golang.org/grpc"
)

func BuildApp(appId string, StorageRoot string, coreAccess bool, dbUri string, memUri string, pusherConnector func(s string, op modules.OriginPacket), logcb func(uint32, ...interface{})) (*modules.App, func(*grpc.Server)) {
	app := modules.NewApp(appId, StorageRoot, coreAccess, dbUri, memUri, pusherConnector, logcb)
	services.CreateDummyService(app, coreAccess)
	services.CreateAuthService(app, coreAccess)
	services.CreateHumanService(app, coreAccess)
	services.CreateInviteService(app, coreAccess)
	services.CreateTowerService(app, coreAccess)
	services.CreateRoomService(app, coreAccess)
	services.CreateMachineService(app, coreAccess)
	services.CreateWorkerService(app, coreAccess)
	return app, grpcModelLoader
}

func grpcModelLoader(gs *grpc.Server) {
	services.LoadAuthGrpcService(gs)
	services.LoadHumanGrpcService(gs)
	services.LoadInviteGrpcService(gs)
	services.LoadTowerGrpcService(gs)
	services.LoadRoomGrpcService(gs)
	services.LoadMachineGrpcService(gs)
	services.LoadWorkerGrpcService(gs)
}