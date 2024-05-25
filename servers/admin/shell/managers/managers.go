package managers

import (
	"sigma/admin/core/runtime"
	network_manager "sigma/admin/shell/managers/network"
	security_manager "sigma/admin/shell/managers/security"
	storage_manager "sigma/admin/shell/managers/storage"
	wasm_manager "sigma/admin/shell/managers/wasm"
)

type Managers struct {
	Federative      bool
	netManager      *network_manager.NetManager
	wasmManager     *wasm_manager.WasmManager
	securityManager *security_manager.SecurityManager
	storageManager  *storage_manager.StorageManager
}

func (s *Managers) PutStorageManager(nm *storage_manager.StorageManager) {
	s.storageManager = nm
}

func (s *Managers) StorageManager() *storage_manager.StorageManager {
	return s.storageManager
}

func (s *Managers) PutNetManager(nm *network_manager.NetManager) {
	s.netManager = nm
}

func (s *Managers) NetManager() *network_manager.NetManager {
	return s.netManager
}

func (s *Managers) PutWasmManager(wm *wasm_manager.WasmManager) {
	s.wasmManager = wm
}

func (s *Managers) WasmManager() *wasm_manager.WasmManager {
	return s.wasmManager
}

func (s *Managers) PutSecurityManager(sm *security_manager.SecurityManager) {
	s.securityManager = sm
}

func (s *Managers) SecurityManager() *security_manager.SecurityManager {
	return s.securityManager
}

func New(sc *runtime.App, maxReqSize int, ip2host map[string]string, host2ip map[string]string, fed bool) *Managers {
	return &Managers{
		securityManager: security_manager.New(sc),
		netManager:      network_manager.New(sc, maxReqSize, ip2host, host2ip, fed),
		wasmManager:     wasm_manager.New(sc),
		storageManager: storage_manager.New(sc),
	}
}
