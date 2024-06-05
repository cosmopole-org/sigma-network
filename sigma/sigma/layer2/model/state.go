package module_model

import (
	"sigma/main/sigma/abstract"
	"sigma/main/sigma/layer1/adapters"
)

type StateL1 struct {
	info abstract.IInfo
	trx  adapters.ITrx
}

func (s *StateL1) Info() abstract.IInfo {
	return s.info
}

func (s *StateL1) Trx() adapters.ITrx {
	return s.trx
}

func (s *StateL1) Dummy() {
	// pass
}

func NewState(info abstract.IInfo, trx adapters.ITrx) *StateL1 {
	return &StateL1{info: info, trx: trx}
}
