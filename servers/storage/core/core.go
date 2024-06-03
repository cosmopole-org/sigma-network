package core

import (
	"sigma/storage/core/adapters"
	"sigma/storage/core/adapters/cache"
	"sigma/storage/core/adapters/federation"
	"sigma/storage/core/adapters/storage"
	"sigma/storage/core/runtime"
	"sigma/storage/core/security"
	services_auth "sigma/storage/core/services/auth"
	services_dummy "sigma/storage/core/services/dummy"
	services_invite "sigma/storage/core/services/invite"
	services_space "sigma/storage/core/services/space"
	services_topic "sigma/storage/core/services/topic"
	services_user "sigma/storage/core/services/user"
	"sigma/storage/core/signaler"
	"sigma/storage/core/utils"
)

func New(appId string, storageRoot string, openToNet bool, stoManager storage.IStorage, memManager cache.ICache, fedManager federation.IFederation, logcb func(uint32, ...interface{})) *runtime.App {
	utils.RegisterLoggerCallback(logcb)
	utils.Log(5, "Creating app...")
	a := &runtime.App{AppId: appId, OpenToNet: openToNet}
	a.PutAdapters(adapters.New(stoManager, memManager, fedManager))
	a.PutSignaler(signaler.CreateSignaler(appId, fedManager))
	a.PutSecurity(security.New(storageRoot, stoManager, memManager, a.Signaler()))
	a.PutServices(runtime.CreateServices(a))
	loadCoreServices(a)
	return a
}

func loadCoreServices(app *runtime.App) {
	services_auth.Run(app)
	services_dummy.Run(app)
	services_user.Run(app)
	services_invite.Run(app)
	services_space.Run(app)
	services_topic.Run(app)
}
