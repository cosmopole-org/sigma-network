package builder

import (
	"sigma/storage/core/managers"
	"sigma/storage/core/managers/memory"
	"sigma/storage/core/managers/storage"
	"sigma/storage/core/models"
	"sigma/storage/core/runtime"
	services_auth "sigma/storage/core/services/auth"
	services_dummy "sigma/storage/core/services/dummy"
	services_invite "sigma/storage/core/services/invite"
	services_space "sigma/storage/core/services/space"
	services_topic "sigma/storage/core/services/topic"
	services_user "sigma/storage/core/services/user"
	"sigma/storage/core/utils"

	"google.golang.org/grpc"
)

func NewApp(appId string, storageRoot string, openToNet bool, stoManager storage.IGlobStorage, memManager memory.IMemory, genControl func() *runtime.Control, pusherConnector func(s string, op models.OriginPacket), logCb func(uint32, ...interface{})) *runtime.App {
	utils.RegisterLoggerCallback(logCb)
	utils.Log(5, "Creating app...")
	a := &runtime.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		CoreAccess:  openToNet,
		GenControl:  genControl,
		Managers:    managers.New(appId, storageRoot, stoManager, memManager, pusherConnector),
	}
	a.LoadCoreServices = func() { loadCoreServices(a) }
	a.Services = runtime.CreateServices(a)
	return a
}

func New(appId string, StorageRoot string, openToNet bool, stoManager storage.IGlobStorage, memManager memory.IMemory, genControl func() *runtime.Control, pusherConnector func(s string, op models.OriginPacket), logcb func(uint32, ...interface{})) (*runtime.App, func(*grpc.Server)) {
	app := NewApp(appId, StorageRoot, openToNet, stoManager, memManager, genControl, pusherConnector, logcb)
	return app, grpcModelLoader
}

func loadCoreServices(app *runtime.App) {
	services_dummy.CreateDummyService(app)
	services_auth.CreateAuthService(app)
	services_user.CreateUserService(app)
	services_invite.CreateInviteService(app)
	services_space.CreateSpaceService(app)
	services_topic.CreateTopicService(app)
}

func grpcModelLoader(gs *grpc.Server) {
	services_auth.LoadAuthGrpcService(gs)
	services_user.LoadHumanGrpcService(gs)
	services_invite.LoadInviteGrpcService(gs)
	services_space.LoadSpaceGrpcService(gs)
	services_topic.LoadTopicGrpcService(gs)
}
