
		package plugger_pluginer

		import (
			"reflect"
			"sigma/sigma/abstract"
			module_logger "sigma/sigma/core/module/logger"

		
			plugger_plugin "sigma/pluginer/pluggers/plugin"
			action_plugin "sigma/pluginer/actions/plugin"
			
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
		
				a_plugin := &action_plugin.Actions{Layer: layer}
				p_plugin := plugger_plugin.New(a_plugin, logger, core)
				PlugThePlugger(layer, p_plugin)
				p_plugin.Install(layer, a_plugin)
			
		}
		