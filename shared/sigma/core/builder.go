package builder

import (
	"sigma/main/core/managers"
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	services_auth "sigma/main/core/services/auth"
	services_dummy "sigma/main/core/services/dummy"
	services_invite "sigma/main/core/services/invite"
	services_space "sigma/main/core/services/space"
	services_topic "sigma/main/core/services/topic"
	services_user "sigma/main/core/services/user"
	"sigma/main/core/utils"

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
