package module_model

import (
	"sigma/sigma/abstract"
	modulemodel "sigma/sigma/layer1/module/state"
)

type StateL2 struct {
	*modulemodel.StateL1
}

type StateBuilder2 struct {
	layer  abstract.ILayer
	bottom abstract.IStateBuilder
}

func NewStateBuilder(layer abstract.ILayer, bottom abstract.IStateBuilder) abstract.IStateBuilder {
	return &StateBuilder2{layer: layer, bottom: bottom}
}

func (sb *StateBuilder2) NewState(args ...interface{}) abstract.IState {
	return &StateL2{sb.bottom.NewState(args[0]).(*modulemodel.StateL1)}
}
