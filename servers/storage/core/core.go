package core

import (
	"sigma/storage/core/adapters"
	"sigma/storage/core/adapters/cache"
	"sigma/storage/core/adapters/federation"
	"sigma/storage/core/adapters/storage"
	"sigma/storage/core/runtime"
	"sigma/storage/core/security"
	actions_auth "sigma/storage/core/services/actions/auth"
	actions_dummy "sigma/storage/core/services/actions/dummy"
	actions_invite "sigma/storage/core/services/actions/invite"
	actions_space "sigma/storage/core/services/actions/space"
	actions_topic "sigma/storage/core/services/actions/topic"
	actions_user "sigma/storage/core/services/actions/user"
	pluggers_auth "sigma/storage/core/services/pluggers/auth"
	pluggers_dummy "sigma/storage/core/services/pluggers/dummy"
	pluggers_invite "sigma/storage/core/services/pluggers/invite"
	pluggers_space "sigma/storage/core/services/pluggers/space"
	pluggers_topic "sigma/storage/core/services/pluggers/topic"
	pluggers_user "sigma/storage/core/services/pluggers/user"
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
	app.Services().PlugService(pluggers_auth.New(app, &actions_auth.AuthActions{App: app}))
	app.Services().PlugService(pluggers_dummy.New(app, &actions_dummy.DummyActions{App: app}))
	app.Services().PlugService(pluggers_user.New(app, &actions_user.UserActions{App: app}))
	app.Services().PlugService(pluggers_invite.New(app, &actions_invite.InviteActions{App: app}))
	app.Services().PlugService(pluggers_space.New(app, &actions_space.SpaceActions{App: app}))
	app.Services().PlugService(pluggers_topic.New(app, &actions_topic.TopicActions{App: app}))
}
