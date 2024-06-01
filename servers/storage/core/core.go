package core

import (
	"sigma/storage/core/runtime"
	services_auth "sigma/storage/core/services/auth"
	services_dummy "sigma/storage/core/services/dummy"
	services_invite "sigma/storage/core/services/invite"
	services_space "sigma/storage/core/services/space"
	services_topic "sigma/storage/core/services/topic"
	services_user "sigma/storage/core/services/user"
	"sigma/storage/core/tools"
	"sigma/storage/core/tools/cache"
	"sigma/storage/core/tools/federation"
	"sigma/storage/core/tools/storage"
	"sigma/storage/core/utils"
)

func New(appId string, storageRoot string, openToNet bool, stoManager storage.IStorage, memManager cache.ICache, fedManager federation.IFederation, logcb func(uint32, ...interface{})) *runtime.App {
	utils.RegisterLoggerCallback(logcb)
	utils.Log(5, "Creating app...")
	a := &runtime.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		CoreAccess:  openToNet,
		Tools:       tools.New(appId, storageRoot, stoManager, memManager, fedManager),
	}
	a.LoadCoreServices = func() { loadCoreServices(a) }
	a.Services = runtime.CreateServices(a)
	loadCoreServices(a)
	return a
}

func loadCoreServices(app *runtime.App) {
	services_dummy.CreateDummyService(app)
	services_auth.CreateAuthService(app)
	services_user.CreateUserService(app)
	services_invite.CreateInviteService(app)
	services_space.CreateSpaceService(app)
	services_topic.CreateTopicService(app)
}
