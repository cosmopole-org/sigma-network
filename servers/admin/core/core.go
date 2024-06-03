package core

import (
	"sigma/admin/core/adapters"
	"sigma/admin/core/adapters/cache"
	"sigma/admin/core/adapters/federation"
	"sigma/admin/core/adapters/storage"
	controllers_auth "sigma/admin/core/services/auth"
	controllers_dummy "sigma/admin/core/services/dummy"
	controllers_user "sigma/admin/core/services/user"
	controllers_invite "sigma/admin/core/services/invite"
	controllers_space "sigma/admin/core/services/space"
	controllers_topic "sigma/admin/core/services/topic"
	"sigma/admin/core/runtime"
	"sigma/admin/core/security"
	"sigma/admin/core/signaler"
	"sigma/admin/core/utils"
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
