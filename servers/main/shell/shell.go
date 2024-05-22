package sigma

import (
	"log"
	"sigma/main/core"
	"sigma/main/core/modules"
	mans "sigma/main/shell/managers"
	"sigma/main/shell/services"
	"sigma/main/shell/store/ipmap"
	coreApp "sigma/main/shell/store/core"
)

type Sigma struct {
	managers *mans.Managers
}

func (s *Sigma) Managers() *mans.Managers {
	return s.managers
}

type ServersOutput struct {
	Map map[string]bool `json:"map"`
}

type ShellConfig struct {
	DbUri       string
	MemUri      string
	StorageRoot string
	Federation  bool
	CoreAccess  bool
}

func (s *Sigma) ConnectServicesToNet() {
	for _, v := range coreApp.Core().Services.Actions {
		s.Managers().NetManager().SwitchNetAccess(
			v.Key,
			v.Access.Http,
			v.Access.ActionType,
			v.Access.Ws,
			v.Access.Grpc,
			func(i interface{}) (any, error) {
				return nil, nil
			}, false,
		)
	}
}

func New(appId string, config ShellConfig) *Sigma {
	log.Println("Creating app...")
	sh := &Sigma{}
	ipmap.LoadWellknownServers()
	_, grpcModelLoader := builder.BuildApp(appId, config.StorageRoot, config.CoreAccess, config.DbUri, config.MemUri, func(s string, op modules.OriginPacket) {
		sh.Managers().NetManager().FedNet.SendInFederation(s, op)
	})
	sh.managers = mans.New()
	grpcModelLoader(sh.Managers().NetManager().GrpcServer.Server)
	services.CreateWasmPluggerService(sh.managers)
	sh.ConnectServicesToNet()
	return sh
}

func (s *Sigma) ConnectToNetwork(ports map[string]int) {
	if ports["http"] > 0 {
		s.Managers().NetManager().HttpServer.Listen(ports["http"])
	}
	if ports["grpc"] > 0 {
		s.Managers().NetManager().GrpcServer.Listen(ports["grpc"])
	}
}