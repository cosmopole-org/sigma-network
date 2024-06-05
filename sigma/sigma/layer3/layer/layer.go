package layer

import (
	"gorm.io/gorm"
	"sigma/sigma/abstract"
	moduleactor "sigma/sigma/core/module/actor"
	modulelogger "sigma/sigma/core/module/logger"
	toolcache "sigma/sigma/layer2/tools/cache"
	toolstorage "sigma/sigma/layer2/tools/storage"
)

type Layer struct {
	actor   abstract.IActor
	toolbox abstract.IToolbox
}

func New() abstract.ILayer {
	return &Layer{actor: moduleactor.NewActor()}
}

func (l *Layer) Fill(args ...interface{}) []interface{} {
	return []interface{}{
		toolstorage.NewStorage(args[0].(*modulelogger.Logger), args[1].(string), args[2].(gorm.Dialector)),
		toolcache.NewCache(args[0].(*modulelogger.Logger), args[3].(string)),
		args[4],
	}
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
