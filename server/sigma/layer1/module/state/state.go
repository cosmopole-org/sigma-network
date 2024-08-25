package module_state

import (
	"sigma/sigma/abstract"
	"sigma/sigma/layer1/adapters"
	toolbox2 "sigma/sigma/layer1/module/toolbox"
)

type IStateL1 interface {
	Dummy() string
	Info() abstract.IInfo
	Trx() adapters.ITrx
	SetTrx(adapters.ITrx)
}

type StateL1 struct {
	info  abstract.IInfo
	trx   adapters.ITrx
	dummy string
}

func (s *StateL1) Info() abstract.IInfo {
	return s.info
}

func (s *StateL1) Trx() adapters.ITrx {
	return s.trx
}

func (s *StateL1) SetTrx(newTrx adapters.ITrx) {
	s.trx = newTrx
}

func (s *StateL1) Dummy() string {
	return s.dummy
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
	if (len(args) > 1) && (args[1] != nil) {
		trx = args[1].(adapters.ITrx)
	} else {
		trx = toolbox.Storage().CreateTrx()
	}
	if len(args) > 0 {
		if len(args) > 2 {
			return &StateL1{info: args[0].(abstract.IInfo), trx: trx, dummy: args[2].(string)}
		} else {
			return &StateL1{info: args[0].(abstract.IInfo), trx: trx, dummy: ""}
		}
	} else {
		return &StateL1{info: nil, trx: trx, dummy: ""}
	}
}
