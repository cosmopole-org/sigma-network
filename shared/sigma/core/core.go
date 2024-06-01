package builder

import (
	"sigma/main/core/runtime"
	services_auth "sigma/main/core/services/auth"
	services_dummy "sigma/main/core/services/dummy"
	services_invite "sigma/main/core/services/invite"
	services_space "sigma/main/core/services/space"
	services_topic "sigma/main/core/services/topic"
	services_user "sigma/main/core/services/user"
	"sigma/main/core/tools"
	"sigma/main/core/tools/cache"
	"sigma/main/core/tools/federation"
	"sigma/main/core/tools/storage"
	"sigma/main/core/utils"
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
