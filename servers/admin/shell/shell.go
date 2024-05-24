package sigma

import (
	"net"
	builder "sigma/admin/core"
	"sigma/admin/core/modules"
	"sigma/admin/core/utils"
	mans "sigma/admin/shell/managers"
	middlewares_wasm "sigma/admin/shell/middlewares"
	"sigma/admin/shell/services"
)

var wellKnownServers = []string{
	"cosmopole.liara.run",
	"monopole.liara.run",
}

type Sigma struct {
	sigmaCore   *modules.App
	managers    *mans.Managers
	ipToHostMap map[string]string
	hostToIpMap map[string]string
}

func (s *Sigma) Managers() *mans.Managers {
	return s.managers
}

func (s *Sigma) Core() *modules.App {
	return s.sigmaCore
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
	MaxReqSize  int
	LogCb       func(uint32, ...interface{})
}

func (s *Sigma) connectServicesToNet() {
	for _, v := range s.sigmaCore.Services.Actions {
		s.Managers().NetManager().SwitchNetAccessByAction(
			v,
			func(i interface{}) (any, error) {
				return nil, nil
			},
		)
	}
}

func (s *Sigma) loadWellknownServers() {
	s.ipToHostMap = map[string]string{}
	s.hostToIpMap = map[string]string{}
	for _, doadmin := range wellKnownServers {
		ipAddr := ""
		ips, _ := net.LookupIP(doadmin)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				ipAddr = ipv4.String()
				break
			}
		}
		s.ipToHostMap[ipAddr] = doadmin
		s.hostToIpMap[doadmin] = ipAddr
	}
	utils.Log(5)
	utils.Log(5, s.hostToIpMap)
	utils.Log(5)
}

func New(appId string, config ShellConfig) *Sigma {
	sh := &Sigma{}
	app, grpcModelLoader := builder.BuildApp(appId, config.StorageRoot, config.CoreAccess, config.DbUri, config.MemUri, func(s string, op modules.OriginPacket) {
		sh.Managers().NetManager().FedNet.SendInFederation(s, op)
	}, config.LogCb)
	sh.loadWellknownServers()
	sh.sigmaCore = app
	sh.managers = mans.New(app, config.MaxReqSize, sh.ipToHostMap, sh.hostToIpMap, config.Federation)
	sh.managers.NetManager().HttpServer.AddMiddleware(middlewares_wasm.WasmMiddleware(app, sh.managers))
	grpcModelLoader(sh.Managers().NetManager().GrpcServer.Server)
	services.CreateWasmPluggerService(app, sh.managers)
	sh.connectServicesToNet()
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
