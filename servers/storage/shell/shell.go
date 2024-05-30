package shell

import (
	"net"
	"sigma/storage/core/models"
	"sigma/storage/core/runtime"
	"sigma/storage/core/utils"
	mans "sigma/storage/shell/managers"
	middlewares_wasm "sigma/storage/shell/middlewares"
	"sigma/storage/shell/services"

	"google.golang.org/grpc"
	"gorm.io/gorm"
)

var wellKnownServers = []string{
	"cosmopole.liara.run",
	"monopole.liara.run",
}

type Shell struct {
	managers    *mans.Managers
	ipToHostMap map[string]string
	hostToIpMap map[string]string
}

func (s *Shell) Managers() *mans.Managers {
	return s.managers
}

type ServersOutput struct {
	Map map[string]bool `json:"map"`
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

func (s *Shell) loadWellknownServers() {
	s.ipToHostMap = map[string]string{}
	s.hostToIpMap = map[string]string{}
	for _, dostorage := range wellKnownServers {
		ipAddr := ""
		ips, _ := net.LookupIP(dostorage)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				ipAddr = ipv4.String()
				break
			}
		}
		s.ipToHostMap[ipAddr] = dostorage
		s.hostToIpMap[dostorage] = ipAddr
	}
	utils.Log(5)
	utils.Log(5, s.hostToIpMap)
	utils.Log(5)
}

func New(app *runtime.App, grpcModelLoader func(*grpc.Server), config Config) *Shell {
	sh := &Shell{}
	sh.loadWellknownServers()
	sh.managers = mans.New(app, config.MaxReqSize, sh.ipToHostMap, sh.hostToIpMap, config.Federation)
	sh.managers.NetManager().HttpServer.AddMiddleware(middlewares_wasm.WasmMiddleware(app, sh.managers))
	grpcModelLoader(sh.Managers().NetManager().GrpcServer.Server)
	services.CreateWasmPluggerService(app, sh.managers)
	return sh
}

type FedConnector struct {
	Shell *Shell
}

func (f *FedConnector) SendToFed(s string, op models.OriginPacket) {
	f.Shell.Managers().NetManager().FedNet.SendInFederation(s, op)
}
