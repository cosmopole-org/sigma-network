package module_model

import (
	"sigma/sigma/abstract"
	"sigma/sigma/layer1/adapters"
	modulemodel "sigma/sigma/layer1/model"
)

type StateL2 struct {
	*modulemodel.StateL1
}

func NewState(info abstract.IInfo, trx adapters.ITrx) *StateL2 {
	return &StateL2{modulemodel.NewState(info, trx)}
}
