package module_model

import (
	"sigma/sigma/abstract"
	modulemodel "sigma/sigma/layer2/model"
)

type StateL3 struct {
	*modulemodel.StateL2
}

type StateBuilder3 struct {
	layer  abstract.ILayer
	bottom abstract.IStateBuilder
}

func NewStateBuilder(layer abstract.ILayer, bottom abstract.IStateBuilder) abstract.IStateBuilder {
	return &StateBuilder3{layer: layer, bottom: bottom}
}

func (sb *StateBuilder3) NewState(args ...interface{}) abstract.IState {
	if len(args) > 0 {
		return &StateL3{sb.bottom.NewState(args...).(*modulemodel.StateL2)}
	} else {
		return &StateL3{sb.bottom.NewState().(*modulemodel.StateL2)}
	}
}
