package builder

import (
	"sigma/admin/core/managers"
	"sigma/admin/core/models"
	"sigma/admin/core/runtime"
	"sigma/admin/core/services"
	"sigma/admin/core/utils"

	"google.golang.org/grpc"
)

func NewApp(appId string, storageRoot string, coreAccess bool, dbUri string, memUri string, pusherConnector func(s string, op models.OriginPacket), logCb func(uint32, ...interface{})) *runtime.App {
	utils.RegisterLoggerCallback(logCb)
	utils.Log(5, "Creating app...")
	a := &runtime.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		CoreAccess:  coreAccess,
		Managers: managers.New(appId, dbUri, memUri, storageRoot, pusherConnector),
	}
	a.Services = runtime.CreateServices(a)
	return a
}

func BuildApp(appId string, StorageRoot string, coreAccess bool, dbUri string, memUri string, pusherConnector func(s string, op models.OriginPacket), logcb func(uint32, ...interface{})) (*runtime.App, func(*grpc.Server)) {
	app := NewApp(appId, StorageRoot, coreAccess, dbUri, memUri, pusherConnector, logcb)
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
