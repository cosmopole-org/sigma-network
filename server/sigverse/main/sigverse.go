
		package plugger_sigverse

		import (
			"reflect"
			"sigma/sigma/abstract"
			module_logger "sigma/sigma/core/module/logger"

		
			plugger_auth "sigma/sigverse/pluggers/auth"
			action_auth "sigma/sigverse/actions/auth"
			
			plugger_dummy "sigma/sigverse/pluggers/dummy"
			action_dummy "sigma/sigverse/actions/dummy"
			
			plugger_interact "sigma/sigverse/pluggers/interact"
			action_interact "sigma/sigverse/actions/interact"
			
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
			
				a_dummy := &action_dummy.Actions{Layer: layer}
				p_dummy := plugger_dummy.New(a_dummy, logger, core)
				PlugThePlugger(layer, p_dummy)
				p_dummy.Install(layer, a_dummy)
			
				a_interact := &action_interact.Actions{Layer: layer}
				p_interact := plugger_interact.New(a_interact, logger, core)
				PlugThePlugger(layer, p_interact)
				p_interact.Install(layer, a_interact)
			
				a_invite := &action_invite.Actions{Layer: layer}
				p_invite := plugger_invite.New(a_invite, logger, core)
				PlugThePlugger(layer, p_invite)
				p_invite.Install(layer, a_invite)
			
				a_space := &action_space.Actions{Layer: layer}
				p_space := plugger_space.New(a_space, logger, core)
				PlugThePlugger(layer, p_space)
				p_space.Install(layer, a_space)
			
				a_topic := &action_topic.Actions{Layer: layer}
				p_topic := plugger_topic.New(a_topic, logger, core)
				PlugThePlugger(layer, p_topic)
				p_topic.Install(layer, a_topic)
			
				a_user := &action_user.Actions{Layer: layer}
				p_user := plugger_user.New(a_user, logger, core)
				PlugThePlugger(layer, p_user)
				p_user.Install(layer, a_user)
			
		}
		