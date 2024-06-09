
		package plugger_sigverse

		import (
			"reflect"
			"sigma/sigma/abstract"
			module_logger "sigma/sigma/core/module/logger"

		
			plugger_auth "sigma/sigverse/pluggers/auth"
			action_auth "sigma/sigverse/actions/auth"
			
			plugger_dummy "sigma/sigverse/pluggers/dummy"
			action_dummy "sigma/sigverse/actions/dummy"
			
			plugger_invite "sigma/sigverse/pluggers/invite"
			action_invite "sigma/sigverse/actions/invite"
			
			plugger_space "sigma/sigverse/pluggers/space"
			action_space "sigma/sigverse/actions/space"
			
			plugger_topic "sigma/sigverse/pluggers/topic"
			action_topic "sigma/sigverse/actions/topic"
			
			plugger_user "sigma/sigverse/pluggers/user"
			action_user "sigma/sigverse/actions/user"
			
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
		
				PlugThePlugger(layer, plugger_auth.New(&action_auth.Actions{Layer: layer}, logger, core))
			
				PlugThePlugger(layer, plugger_dummy.New(&action_dummy.Actions{Layer: layer}, logger, core))
			
				PlugThePlugger(layer, plugger_invite.New(&action_invite.Actions{Layer: layer}, logger, core))
			
				PlugThePlugger(layer, plugger_space.New(&action_space.Actions{Layer: layer}, logger, core))
			
				PlugThePlugger(layer, plugger_topic.New(&action_topic.Actions{Layer: layer}, logger, core))
			
				PlugThePlugger(layer, plugger_user.New(&action_user.Actions{Layer: layer}, logger, core))
			
		}
		