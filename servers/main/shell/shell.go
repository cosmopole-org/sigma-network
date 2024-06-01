package shell

import (
	"net"
	core "sigma/main/core"
	"sigma/main/core/runtime"
	"sigma/main/core/utils"
	middlewares_wasm "sigma/main/shell/middlewares"
	shell_federation "sigma/main/shell/network/federation"
	"sigma/main/shell/services"
	tools "sigma/main/shell/tools"
	memory_manager "sigma/main/shell/tools/memory"
	storage_manager "sigma/main/shell/tools/storage"

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
	for _, domain := range wellKnownServers {
		ipAddr := ""
		ips, _ := net.LookupIP(domain)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				ipAddr = ipv4.String()
				break
			}
		}
		s.ipToHostMap[ipAddr] = domain
		s.hostToIpMap[domain] = ipAddr
	}
	utils.Log(5)
	utils.Log(5, s.hostToIpMap)
	utils.Log(5)
}

func (sh *Shell) loaShellServices() {
	services.CreateWasmPluggerService(sh.core, sh.tools)
}

func (sh *Shell) install(co *runtime.App, storage *storage_manager.StorageManager, fed *shell_federation.FedNet, maxReqSize int) {
	sh.core = co
	sh.tools = tools.New(co, storage, maxReqSize, sh.ipToHostMap, sh.hostToIpMap, fed)
	sh.loadWellknownServers()
	sh.loaShellServices()
}

type ShellCoreTools struct {
	storage    *storage_manager.StorageManager
	cache      *memory_manager.MemoryManager
	federation *shell_federation.FedNet
}

func createShellCoreServices(dbConn gorm.Dialector, redisUri string) *ShellCoreTools {
	shellCoreTools := &ShellCoreTools{}
	shellCoreTools.storage = storage_manager.CreateDatabase(dbConn)
	shellCoreTools.cache = memory_manager.CreateMemory(redisUri)
	shellCoreTools.federation = shell_federation.CreateFederation()
	return shellCoreTools
}

func New(appId string, config Config) *Shell {
	// create shell
	sh := &Shell{}
	// create shell-core tools
	scTools := createShellCoreServices(config.DbConn, config.MemUri)
	// create core
	co := core.New(appId, config.StorageRoot, config.CoreAccess, scTools.storage, scTools.cache, scTools.federation, config.LogCb)
	// install shell on core
	sh.install(co, scTools.storage, scTools.federation, config.MaxReqSize)
	// setup federation
	scTools.federation.Setup(co, scTools.storage, sh.tools.Signaler(), sh.ipToHostMap, sh.hostToIpMap)
	// insert middlewares
	co.Services.PutMiddleware(middlewares_wasm.WasmMiddleware(co, sh.tools))
	return sh
}
