package core

import (
	"sigma/main/core/adapters"
	"sigma/main/core/adapters/cache"
	"sigma/main/core/adapters/federation"
	"sigma/main/core/adapters/storage"
	controllers_auth "sigma/main/core/services/auth"
	controllers_dummy "sigma/main/core/services/dummy"
	controllers_user "sigma/main/core/services/user"
	controllers_invite "sigma/main/core/services/invite"
	controllers_space "sigma/main/core/services/space"
	controllers_topic "sigma/main/core/services/topic"
	"sigma/main/core/runtime"
	"sigma/main/core/security"
	"sigma/main/core/signaler"
	"sigma/main/core/utils"
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
