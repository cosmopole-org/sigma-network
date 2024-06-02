package sigma

import (
	"sigma/storage/core/runtime"
	"sigma/storage/shell"
	app_l2 "sigma/storage/shell/shell"
)

type Sigma struct {
	Core  *runtime.App
	Shell *app_l2.Shell
}

func New(appId string, config shell.Config) *Sigma {
	// shell
	sh := shell.New(appId, config)
	// create sigma
	s := &Sigma{Shell: sh, Core: sh.Core()}
	// connect whole sigma services to net based on coreAccess flag
	sh.ConnectServicesToNetAdapter()
	// sigma ready
	return s
}

func (s *Sigma) RunNetwork(ports map[string]int) {
	if ports["http"] > 0 {
		s.Shell.Toolbox().Net().HttpServer.Listen(ports["http"])
	}
	if ports["grpc"] > 0 {
		s.Shell.Toolbox().Net().GrpcServer.Listen(ports["grpc"])
	}
	if ports["push"] > 0 {
		s.Shell.Toolbox().Net().PusherServer.Listen(ports["push"])
	}
}
