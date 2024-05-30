package sigma

import (
	builder "sigma/admin/core"
	"sigma/admin/core/runtime"
	"sigma/admin/shell"
)

type Sigma struct {
	Core  *runtime.App
	Shell *shell.Shell
}

func New(appId string, config shell.Config) *Sigma {
	fedConnector := &shell.FedConnector{}
	app, grpcModelLoader := builder.BuildApp(appId, config.StorageRoot, config.CoreAccess, config.DbConn, config.MemUri, fedConnector.SendToFed, config.LogCb)
	sh := shell.New(app, grpcModelLoader, config)
	fedConnector.Shell = sh
	s := &Sigma{
		Core: app,
		Shell: sh,
	}
	s.connectServicesToNet()
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

func (s *Sigma) connectServicesToNet() {
	for _, v := range s.Core.Services.Actions {
		s.Shell.Managers().NetManager().SwitchNetAccessByAction(
			v,
			func(i interface{}) (any, error) {
				return nil, nil
			},
		)
	}
}
