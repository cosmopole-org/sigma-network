
		package plugger_sigverse

		import (
			"reflect"
			"sigma/sigma/abstract"
			module_logger "sigma/sigma/core/module/logger"

		
			plugger_test "sigma/sigverse/pluggers/test"
			action_test "sigma/sigverse/actions/test"
			
		)

		func PlugThePlugger(layer abstract.ILayer, plugger interface{}) {
			s := reflect.TypeOf(plugger)
			for i := 0; i < s.NumMethod(); i++ {
				f := s.Method(i)
				if f.Name == "Install" {
					f.Func.Call([]reflect.Value{reflect.ValueOf(plugger)})
				} else {
					result := f.Func.Call([]reflect.Value{reflect.ValueOf(plugger)})
					action := result[0].Interface().(abstract.IAction)
					layer.Actor().InjectAction(action)
				}
			}
		}
	
		func PlugAll(layer abstract.ILayer, logger *module_logger.Logger, core abstract.ICore) {
		
				PlugThePlugger(layer, plugger_test.New(&action_test.Actions{Layer: layer}, logger, core))
			
		}
		