package builder

import (
	"sigma/main/core/managers"
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	"sigma/main/core/services"
	"sigma/main/core/utils"

	"google.golang.org/grpc"
	"gorm.io/gorm"
)

func NewApp(appId string, storageRoot string, coreAccess bool, dialector gorm.Dialector, memUri string, pusherConnector func(s string, op models.OriginPacket), logCb func(uint32, ...interface{})) *runtime.App {
	utils.RegisterLoggerCallback(logCb)
	utils.Log(5, "Creating app...")
	a := &runtime.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		CoreAccess:  coreAccess,
		Managers:    managers.New(appId, dialector, memUri, storageRoot, pusherConnector),
	}
	a.Services = runtime.CreateServices(a)
	return a
}

func BuildApp(appId string, StorageRoot string, coreAccess bool, dialector gorm.Dialector, memUri string, pusherConnector func(s string, op models.OriginPacket), logcb func(uint32, ...interface{})) (*runtime.App, func(*grpc.Server)) {
	app := NewApp(appId, StorageRoot, coreAccess, dialector, memUri, pusherConnector, logcb)
	services.CreateDummyService(app, coreAccess)
	services.CreateAuthService(app, coreAccess)
	services.CreateHumanService(app, coreAccess)
	services.CreateInviteService(app, coreAccess)
	services.CreateSpaceService(app, coreAccess)
	services.CreateTopicService(app, coreAccess)
	services.CreateMachineService(app, coreAccess)
	services.CreateWorkerService(app, coreAccess)
	return app, grpcModelLoader
}

func grpcModelLoader(gs *grpc.Server) {
	services.LoadAuthGrpcService(gs)
	services.LoadHumanGrpcService(gs)
	services.LoadInviteGrpcService(gs)
	services.LoadSpaceGrpcService(gs)
	services.LoadTopicGrpcService(gs)
	services.LoadMachineGrpcService(gs)
	services.LoadWorkerGrpcService(gs)
}
