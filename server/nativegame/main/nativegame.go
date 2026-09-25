// Package plugger_nativegame_main registers the native build of the benchmark
// game with a layer, by the same direct-injection route the platform's own
// action packages use.
package plugger_nativegame_main

import (
	"reflect"
	"sigma/sigma/abstract"
	module_logger "sigma/sigma/core/module/logger"

	action_game "sigma/nativegame/actions/game"
	plugger_game "sigma/nativegame/pluggers/game"
)

func PlugThePlugger(layer abstract.ILayer, plugger interface{}) {
	s := reflect.TypeOf(plugger)
	for i := 0; i < s.NumMethod(); i++ {
		f := s.Method(i)
		if f.Name != "Install" {
			result := f.Func.Call([]reflect.Value{reflect.ValueOf(plugger)})
			action := result[0].Interface().(abstract.IAction)
			layer.Actor().InjectAction(action)
		}
	}
}

func PlugAll(layer abstract.ILayer, logger *module_logger.Logger, core abstract.ICore) {
	a := &action_game.Actions{Layer: layer}
	p := plugger_game.New(a, logger, core)
	PlugThePlugger(layer, p)
	p.Install(layer, a)
}
