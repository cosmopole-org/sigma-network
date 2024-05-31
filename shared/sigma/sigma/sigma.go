package sigma

import (
	core "sigma/main/core"
	"sigma/main/core/runtime"
	"sigma/main/shell"
	memory_manager "sigma/main/shell/managers/memory"
	storage_manager "sigma/main/shell/managers/storage"
)

type Sigma struct {
	Core  *runtime.App
	Shell *shell.Shell
}

func (s *Sigma) generateControl() *runtime.Control {
	return &runtime.Control{
		AppId:       s.Core.AppId,
		StorageRoot: s.Core.StorageRoot,
		Trx:         s.Shell.Managers().StorageManager().CreateTrx(),
		Services:    s.Core.Services,
	}
}

func New(appId string, config shell.Config) *Sigma {
	s := &Sigma{}
	//sigma-shell level managers
	fedConnector := &shell.FedConnector{}
	stoManager := storage_manager.CreateDatabase(config.DbConn)
	memManager := memory_manager.CreateMemory(config.MemUri)
	// core
	app, grpcModelLoader := core.New(appId, config.StorageRoot, config.CoreAccess, stoManager, memManager, s.generateControl, fedConnector.SendToFed, config.LogCb)
	// shell
	sh := shell.New(app, stoManager, grpcModelLoader, config)
	// connect wires
	fedConnector.Shell = sh
	s.Core = app
	s.Shell = sh
	// load core services
	app.LoadCoreServices()
	// connect sigma whole services to net based on coreAccess flag
	sh.ConnectServicesToNet()
	// sigma ready
	return s
}

func (s *Sigma) ConnectToNetwork(ports map[string]int) {
	if ports["http"] > 0 {
		s.Shell.Managers().NetManager().HttpServer.Listen(ports["http"])
	}
	if ports["grpc"] > 0 {
		s.Shell.Managers().NetManager().GrpcServer.Listen(ports["grpc"])
	}
}

