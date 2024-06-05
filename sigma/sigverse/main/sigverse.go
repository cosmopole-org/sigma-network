
		package plugger_sigverse

		import (
			"reflect"
			"sigma/main/sigma/abstract"
		
			plugger_dummy "sigma/main/sigverse/pluggers/dummy"
			action_dummy "sigma/main/sigverse/actions/dummy"
			
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
	
		func PlugAll(layer abstract.ILayer) {
		
				PlugThePlugger(layer, plugger_dummy.New(&action_dummy.Actions{Layer: layer}))
			
		}
		