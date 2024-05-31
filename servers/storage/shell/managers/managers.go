package managers

import (
	coreManagers "sigma/storage/core/managers"
	"sigma/storage/core/managers/storage"
	"sigma/storage/core/runtime"
	file_manager "sigma/storage/shell/managers/files"
	network_manager "sigma/storage/shell/managers/network"
	wasm_manager "sigma/storage/shell/managers/wasm"
)

type IShellManagers interface {
	coreManagers.ICoreManagers
	FileManager() *file_manager.FileManager
	NetManager() *network_manager.NetManager
	WasmManager() *wasm_manager.WasmManager
}

type Managers struct {
	coreManagers.ICoreManagers
	Federative     bool
	storageManager storage.IGlobStorage
	netManager     *network_manager.NetManager
	wasmManager    *wasm_manager.WasmManager
	fileManager    *file_manager.FileManager
}

func (s *Managers) StorageManager() storage.IGlobStorage {
	return s.storageManager
}

func (s *Managers) FileManager() *file_manager.FileManager {
	return s.fileManager
}

func (s *Managers) NetManager() *network_manager.NetManager {
	return s.netManager
}

func (s *Managers) WasmManager() *wasm_manager.WasmManager {
	return s.wasmManager
}

func New(sc *runtime.App, storage storage.IGlobStorage, maxReqSize int, ip2host map[string]string, host2ip map[string]string, fed bool) *Managers {
	mans := Managers{
		ICoreManagers: sc.Managers,
		netManager:    network_manager.New(sc, maxReqSize, ip2host, host2ip, fed),
		wasmManager:   wasm_manager.New(sc),
		fileManager:   file_manager.New(sc),
		storageManager: storage,
	}
	return &mans
}
