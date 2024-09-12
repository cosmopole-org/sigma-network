package core

import (
	"sigma/main/core/adapters"
	"sigma/main/core/adapters/cache"
	"sigma/main/core/adapters/federation"
	"sigma/main/core/adapters/storage"
	"sigma/main/core/runtime"
	"sigma/main/core/security"
	actions_auth "sigma/main/core/services/actions/auth"
	actions_dummy "sigma/main/core/services/actions/dummy"
	actions_invite "sigma/main/core/services/actions/invite"
	actions_space "sigma/main/core/services/actions/space"
	actions_topic "sigma/main/core/services/actions/topic"
	actions_user "sigma/main/core/services/actions/user"
	pluggers_auth "sigma/main/core/services/pluggers/auth"
	pluggers_dummy "sigma/main/core/services/pluggers/dummy"
	pluggers_invite "sigma/main/core/services/pluggers/invite"
	pluggers_space "sigma/main/core/services/pluggers/space"
	pluggers_topic "sigma/main/core/services/pluggers/topic"
	pluggers_user "sigma/main/core/services/pluggers/user"
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
	app.Services().PlugService(pluggers_auth.New(app, &actions_auth.AuthActions{App: app}))
	app.Services().PlugService(pluggers_dummy.New(app, &actions_dummy.DummyActions{App: app}))
	app.Services().PlugService(pluggers_user.New(app, &actions_user.UserActions{App: app}))
	app.Services().PlugService(pluggers_invite.New(app, &actions_invite.InviteActions{App: app}))
	app.Services().PlugService(pluggers_space.New(app, &actions_space.SpaceActions{App: app}))
	app.Services().PlugService(pluggers_topic.New(app, &actions_topic.TopicActions{App: app}))
}
