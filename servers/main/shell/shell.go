package shell

import (
	core "sigma/main/core"
	middlewares_wasm "sigma/main/shell/middlewares"
	app_l2 "sigma/main/shell/shell"
	"gorm.io/gorm"
)

var wellKnownServers = []string{
	"cosmopole.liara.run",
	"monopole.liara.run",
}

type Config struct {
	DbConn      gorm.Dialector
	MemUri      string
	StorageRoot string
	Federation  bool
	CoreAccess  bool
	MaxReqSize  int
	LogCb       func(uint32, ...interface{})
}

func New(appId string, config Config) *app_l2.Shell {
	// create shell
	sh := &app_l2.Shell{}
	// create shell-core tools
	scTools := app_l2.CreateShellCoreServices(config.DbConn, config.MemUri)
	// create core
	co := core.New(appId, config.StorageRoot, config.CoreAccess, scTools.Storage, scTools.Cache, scTools.Federation, config.LogCb)
	// install shell on core
	sh.Install(co, scTools.Storage, scTools.Federation, config.MaxReqSize, wellKnownServers)
	// setup federation
	// insert middlewares
	co.Services().PutMiddleware(middlewares_wasm.WasmMiddleware(sh.Toolbox()))
	return sh
}
