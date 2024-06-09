package module_state

import (
	"sigma/sigma/abstract"
	"sigma/sigma/layer1/adapters"
	toolbox2 "sigma/sigma/layer1/module/toolbox"
)

type IStateL1 interface {
	Info() abstract.IInfo
	Trx() adapters.ITrx
}

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

type StateBuilder1 struct {
	layer  abstract.ILayer
	bottom abstract.IStateBuilder
}

func NewStateBuilder(layer abstract.ILayer, bottom abstract.IStateBuilder) abstract.IStateBuilder {
	return &StateBuilder1{layer: layer, bottom: bottom}
}

func (sb *StateBuilder1) NewState(args ...interface{}) abstract.IState {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](sb.layer.Tools())
	var trx adapters.ITrx
	if len(args) > 1 {
		trx = args[1].(adapters.ITrx)
	} else {
		trx = toolbox.Storage().CreateTrx()
	}
	return &StateL1{info: args[0].(abstract.IInfo), trx: trx}
}
