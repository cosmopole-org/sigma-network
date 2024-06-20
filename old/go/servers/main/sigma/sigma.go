package sigma

import (
	"sigma/main/core/runtime"
	"sigma/main/shell"
	app_l2 "sigma/main/shell/shell"
)

type Internal struct {
	Core  *runtime.App
	Shell *app_l2.Shell
}

type Sigma struct {
	Internal *Internal
}

func New(appId string, config shell.Config) *Sigma {
	// shell
	sh := shell.New(appId, config)
	// create sigma
	s := &Sigma{&Internal{Shell: sh, Core: sh.Core()}}
	// connect whole sigma services to net based on coreAccess flag
	sh.ConnectServicesToNetAdapter()
	// sigma ready
	return s
}

func (s *Sigma) RunNetProtocol(protocol string, port int) {
	if protocol == "http" {
		s.Internal.Shell.Toolbox().Net().HttpServer.Listen(port)
	}
	if protocol == "grpc" {
		s.Internal.Shell.Toolbox().Net().GrpcServer.Listen(port)
	}
	if protocol == "push" {
		s.Internal.Shell.Toolbox().Net().PusherServer.Listen(port)
	}
}
