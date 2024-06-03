package core

import (
	"sigma/storage/core/adapters"
	"sigma/storage/core/adapters/cache"
	"sigma/storage/core/adapters/federation"
	"sigma/storage/core/adapters/storage"
	controllers_auth "sigma/storage/core/services/auth"
	controllers_dummy "sigma/storage/core/services/dummy"
	controllers_user "sigma/storage/core/services/user"
	controllers_invite "sigma/storage/core/services/invite"
	controllers_space "sigma/storage/core/services/space"
	controllers_topic "sigma/storage/core/services/topic"
	"sigma/storage/core/runtime"
	"sigma/storage/core/security"
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
	app.Services().PlugService(&controllers_auth.Controller{App: app})
	app.Services().PlugService(&controllers_dummy.Controller{App: app})
	app.Services().PlugService(&controllers_user.Controller{App: app})
	app.Services().PlugService(&controllers_invite.Controller{App: app})
	app.Services().PlugService(&controllers_space.Controller{App: app})
	app.Services().PlugService(&controllers_topic.Controller{App: app})
}
