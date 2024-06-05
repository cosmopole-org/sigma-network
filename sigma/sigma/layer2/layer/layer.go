package layer

import (
	"sigma/main/sigma/abstract"
	moduleactor "sigma/main/sigma/core/module/actor"
	"sigma/main/sigma/layer1/adapters"
	modulemodel "sigma/main/sigma/layer1/model"
)

type Layer struct {
	actor   abstract.IActor
	toolbox abstract.IToolbox
}

func NewLayer1(storage adapters.IStorage, cache adapters.ICache) abstract.ILayer {
	return &Layer{moduleactor.NewActor(), modulemodel.NewTools(storage, cache)}
}

func (l *Layer) Index() int {
	return 0
}

func (l *Layer) Actor() abstract.IActor {
	return l.actor
}

func (l *Layer) Tools() abstract.IToolbox {
	return l.toolbox
}
