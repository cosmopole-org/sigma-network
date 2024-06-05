
		package plugger_sigverse

		import (
			"reflect"
			"sigma/sigma/abstract"
		
			plugger_test "sigma/sigverse/pluggers/test"
			action_test "sigma/sigverse/actions/test"
			
		)

		func PlugThePlugger(layer abstract.ILayer, plugger interface{}, logger abstract.ILogger, core abstract.ICore) {
			s := reflect.TypeOf(plugger)
			for i := 0; i < s.NumMethod(); i++ {
				f := s.Method(i)
				if f.Name == "Install" {
					f.Func.Call([]reflect.Value{reflect.ValueOf(plugger)})
				} else {
					result := f.Func.Call([]reflect.Value{reflect.ValueOf(plugger)})
					action := result[0].Interface().(abstract.IAction)
					layer.Actor().InjectAction(action, logger, core)
				}
			}
		}
	
		func PlugAll(layer abstract.ILayer, logger abstract.ILogger, core abstract.ICore) {
		
				PlugThePlugger(layer, plugger_test.New(&action_test.Actions{Layer: layer}), logger, core)
			
		}
		