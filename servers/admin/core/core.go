package builder

import (
	"sigma/admin/core/runtime"
	services_auth "sigma/admin/core/services/auth"
	services_dummy "sigma/admin/core/services/dummy"
	services_invite "sigma/admin/core/services/invite"
	services_space "sigma/admin/core/services/space"
	services_topic "sigma/admin/core/services/topic"
	services_user "sigma/admin/core/services/user"
	"sigma/admin/core/tools"
	"sigma/admin/core/tools/cache"
	"sigma/admin/core/tools/federation"
	"sigma/admin/core/tools/storage"
	"sigma/admin/core/utils"
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
