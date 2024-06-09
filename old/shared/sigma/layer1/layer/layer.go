package layer

import (
	"sigma/main/layer1/adapters"
	"sigma/main/layer1/models"
	"sigma/main/layer1/runtime"
)

type Layer struct {
	core *core.Core
	adapters adapters.Adapters
}

func (l *Layer) Number() int {
	return 1
}

func (l *Layer) GenerateState() models.ISigmaStatePool {
	return &core.Layer1StatePool{
		Trx: l.adapters.Storage().CreateTrx(),
	}
}

func (l *Layer) PutService(s interface{}) {
	l.core.Services().PlugService(l.Number(), s)
}

func (l *Layer) PutAdapters(ss adapters.Adapters) {
	l.adapters = ss
}

func (l *Layer) Adapters() *adapters.Adapters {
	return &l.adapters
}
