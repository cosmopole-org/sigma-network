package module_core

import (
	"sigma/sigma/abstract"
	moduleactor "sigma/sigma/core/module/actor"
	modulecoremodel "sigma/sigma/core/module/core/model"
)

type Core struct {
	id     string
	utils  abstract.IUtils
	gods   []string
	layers []abstract.ILayer
	actor  *moduleactor.Actor
}

func NewCore(id string, log abstract.Log) abstract.ICore {
	return &Core{id, modulecoremodel.NewUtils(log), make([]string, 0), make([]abstract.ILayer, 0), moduleactor.NewActor()}
}

func (c *Core) Push(l abstract.ILayer) {
	c.layers = append(c.layers, l)
}

func (c *Core) Get(index int) abstract.ILayer {
	return c.layers[index-1]
}

func (c *Core) Id() string {
	return c.id
}

func (c *Core) Layers() []abstract.ILayer {
	return c.layers
}

func (c *Core) Gods() []string {
	return c.gods
}

func (c *Core) Load(gods []string, layers []abstract.ILayer, args []interface{}) {
	c.gods = gods
	c.layers = layers
	var output = args
	for i := len(layers) - 1; i >= 0; i-- {
		output = layers[i].BackFill(c, output...)
	}
	var sb abstract.IStateBuilder
	for i := 0; i < len(layers); i++ {
		sb = layers[i].InitSb(sb)
		if i > 0 {
			layers[i].ForFill(c, layers[i-1].Tools())
		} else {
			layers[i].ForFill(c)
		}
	}
}

func (c *Core) Utils() abstract.IUtils {
	return c.utils
}
