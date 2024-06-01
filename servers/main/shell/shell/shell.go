package app_l2

import (
	"net"
	"sigma/main/core/runtime"
	"sigma/main/core/utils"
	shell_federation "sigma/main/shell/network/federation"
	"sigma/main/shell/services"
	tools "sigma/main/shell/tools"
	memory_manager "sigma/main/shell/tools/memory"
	storage_manager "sigma/main/shell/tools/storage"

	"gorm.io/gorm"
)

type Shell struct {
	toolbox       *tools.Toolbox
	ipToHostMap map[string]string
	hostToIpMap map[string]string
}

func (s *Shell) ConnectServicesToNetAdapter() {
	for _, v := range s.toolbox.Services().Actions {
		s.toolbox.Net().SwitchNetAccessByAction(
			v,
			func(i interface{}) (any, error) {
				return nil, nil
			},
		)
	}
}

func (s *Shell) Toolbox() *tools.Toolbox {
	return s.toolbox
}

func (s *Shell) Core() *runtime.App {
	return s.toolbox.App
}

type ServersOutput struct {
	Map map[string]bool `json:"map"`
}

func (s *Shell) loadWellknownServers(wellKnownServers []string) {
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
	services.CreateWasmPluggerService(sh.toolbox)
}

func (sh *Shell) Install(co *runtime.App, storage *storage_manager.StorageManager, fed *shell_federation.FedNet, maxReqSize int, wks []string) {
	sh.toolbox = tools.New(co, storage, maxReqSize, sh.ipToHostMap, sh.hostToIpMap, fed)
	sh.loadWellknownServers(wks)
	sh.loaShellServices()
	fed.Setup(co, sh.ipToHostMap, sh.hostToIpMap)
}

type ShellCoreTools struct {
	Storage    *storage_manager.StorageManager
	Cache      *memory_manager.MemoryManager
	Federation *shell_federation.FedNet
}

func CreateShellCoreServices(dbConn gorm.Dialector, redisUri string) *ShellCoreTools {
	shellCoreTools := &ShellCoreTools{}
	shellCoreTools.Storage = storage_manager.CreateDatabase(dbConn)
	shellCoreTools.Cache = memory_manager.CreateMemory(redisUri)
	shellCoreTools.Federation = shell_federation.CreateFederation()
	return shellCoreTools
}
