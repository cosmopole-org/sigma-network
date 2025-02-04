
		package plugger_admin

		import (
			"reflect"
			"sigma/sigma/abstract"
			module_logger "sigma/sigma/core/module/logger"

		
			plugger_auth "sigma/admin/pluggers/auth"
			action_auth "sigma/admin/actions/auth"
			
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
		
				a_auth := &action_auth.Actions{Layer: layer}
				p_auth := plugger_auth.New(a_auth, logger, core)
				PlugThePlugger(layer, p_auth)
				p_auth.Install(layer, a_auth)
			
		}
		