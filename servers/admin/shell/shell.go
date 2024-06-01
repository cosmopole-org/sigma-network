package shell

import (
	"net"
	core "sigma/admin/core"
	"sigma/admin/core/runtime"
	"sigma/admin/core/utils"
	middlewares_wasm "sigma/admin/shell/middlewares"
	shell_federation "sigma/admin/shell/network/federation"
	"sigma/admin/shell/services"
	tools "sigma/admin/shell/tools"
	memory_manager "sigma/admin/shell/tools/memory"
	storage_manager "sigma/admin/shell/tools/storage"

	"gorm.io/gorm"
)

var wellKnownServers = []string{
	"cosmopole.liara.run",
	"monopole.liara.run",
}

type Shell struct {
	core        *runtime.App
	tools       tools.IShellTools
	ipToHostMap map[string]string
	hostToIpMap map[string]string
}

func (s *Shell) ConnectServicesToNetAdapter() {
	for _, v := range s.core.Services.Actions {
		s.tools.Net().SwitchNetAccessByAction(
			v,
			func(i interface{}) (any, error) {
				return nil, nil
			},
		)
	}
}

func (s *Shell) Tools() tools.IShellTools {
	return s.tools
}

func (s *Shell) Core() *runtime.App {
	return s.core
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

func (sh *Shell) installCore(c *runtime.App) {
	sh.core = c
}

func New(appId string, config Config) *Shell {
	// create shell ref
	sh := &Shell{}
	// create shell-core tools
	storage := storage_manager.CreateDatabase(config.DbConn)
	cache := memory_manager.CreateMemory(config.MemUri)
	fed := shell_federation.CreateFederation()
	// create core
	co := core.New(appId, config.StorageRoot, config.CoreAccess, storage, cache, fed, config.LogCb)
	sh.installCore(co)
	sh.loadWellknownServers()
	sh.tools = tools.New(co, storage, config.MaxReqSize, sh.ipToHostMap, sh.hostToIpMap, fed)
	fed.Run(co, sh.ipToHostMap, sh.hostToIpMap)
	co.Services.PutMiddleware(middlewares_wasm.WasmMiddleware(co, sh.tools))
	co.LoadCoreServices()
	services.CreateWasmPluggerService(co, sh.tools)
	return sh
}
