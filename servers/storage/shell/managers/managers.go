package managers

import (
	network_manager "sigma/storage/shell/managers/network"
	security_manager "sigma/storage/shell/managers/security"
	wasm_manager "sigma/storage/shell/managers/wasm"
)

type Managers struct {
	Federative      bool
	netManager      *network_manager.NetManager
	wasmManager     *wasm_manager.WasmManager
	securityManager *security_manager.SecurityManager
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

func New(maxReqSize int) *Managers {
	return &Managers{
		securityManager: security_manager.New(),
		netManager: network_manager.New(maxReqSize),
		wasmManager: wasm_manager.New(),
	}
}
