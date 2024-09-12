package app_l2

import (
	"net"
	"sigma/main/core/runtime"
	"sigma/main/core/utils"
	shell_federation "sigma/main/shell/network/federation"
	actions_wasm "sigma/main/shell/services/actions/wasm"
	pluggers_wasm "sigma/main/shell/services/pluggers/wasm"
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



func (sh *Shell) loaShellServices() {
	sh.toolbox.Services().PlugService(pluggers_wasm.New(sh.Core(), actions_wasm.New(sh.toolbox)))
}

func (sh *Shell) Install(co *runtime.App, storage *storage_manager.StorageManager, fed *shell_federation.FedNet, maxReqSize int, wks []string) {
	sh.toolbox = tools.New(co, maxReqSize, sh.ipToHostMap, sh.hostToIpMap, fed)
	sh.loadWellknownServers(wks)
	sh.loaShellServices()
	fed.Setup(co, sh.ipToHostMap, sh.hostToIpMap)
}

type ShellCoreTools struct {
	Storage    *storage_manager.StorageManager
	Cache      *memory_manager.MemoryManager
	Federation *shell_federation.FedNet
}

func CreateShellCoreServices(dbConn gorm.Dialector, storageRoot string, redisUri string) *ShellCoreTools {
	shellCoreTools := &ShellCoreTools{}
	shellCoreTools.Storage = storage_manager.CreateDatabase(storageRoot, dbConn)
	shellCoreTools.Cache = memory_manager.CreateMemory(redisUri)
	shellCoreTools.Federation = shell_federation.CreateFederation()
	return shellCoreTools
}
