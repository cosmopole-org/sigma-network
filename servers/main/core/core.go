package core

import (
	"sigma/main/core/adapters"
	"sigma/main/core/adapters/cache"
	"sigma/main/core/adapters/federation"
	"sigma/main/core/adapters/storage"
	"sigma/main/core/runtime"
	"sigma/main/core/security"
	services_auth "sigma/main/core/services/auth"
	services_dummy "sigma/main/core/services/dummy"
	services_invite "sigma/main/core/services/invite"
	services_space "sigma/main/core/services/space"
	services_topic "sigma/main/core/services/topic"
	services_user "sigma/main/core/services/user"
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
	app.Services().PlugService(&services_auth.AuthService{App: app})
	app.Services().PlugService(&services_dummy.DummyService{App: app})
	app.Services().PlugService(&services_user.UserService{App: app})
	app.Services().PlugService(&services_space.SpaceService{App: app})
	app.Services().PlugService(&services_topic.TopicService{App: app})
	services_user.CreateUserService(app)
	services_invite.CreateInviteService(app)
	services_space.CreateSpaceService(app)
	services_topic.CreateTopicService(app)
}
