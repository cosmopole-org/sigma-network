package builder

import (
	"sigma/storage/core/managers"
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
	"gorm.io/gorm"
)

func NewApp(appId string, storageRoot string, openToNet bool, dialector gorm.Dialector, memUri string, pusherConnector func(s string, op models.OriginPacket), logCb func(uint32, ...interface{})) *runtime.App {
	utils.RegisterLoggerCallback(logCb)
	utils.Log(5, "Creating app...")
	a := &runtime.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		CoreAccess:  openToNet,
		Managers:    managers.New(appId, dialector, memUri, storageRoot, pusherConnector),
	}
	a.Services = runtime.CreateServices(a)
	return a
}

func BuildApp(appId string, StorageRoot string, openToNet bool, dialector gorm.Dialector, memUri string, pusherConnector func(s string, op models.OriginPacket), logcb func(uint32, ...interface{})) (*runtime.App, func(*grpc.Server)) {
	app := NewApp(appId, StorageRoot, openToNet, dialector, memUri, pusherConnector, logcb)
	services_dummy.CreateDummyService(app, openToNet)
	services_auth.CreateAuthService(app, openToNet)
	services_user.CreateUserService(app, openToNet)
	services_invite.CreateInviteService(app, openToNet)
	services_space.CreateSpaceService(app, openToNet)
	services_topic.CreateTopicService(app, openToNet)
	return app, grpcModelLoader
}

func grpcModelLoader(gs *grpc.Server) {
	services_auth.LoadAuthGrpcService(gs)
	services_user.LoadHumanGrpcService(gs)
	services_invite.LoadInviteGrpcService(gs)
	services_space.LoadSpaceGrpcService(gs)
	services_topic.LoadTopicGrpcService(gs)
}
