
	package pluggers_auth

	import (
		"sigma/main/core/runtime"
		actions_auth "sigma/main/core/services/actions/auth"
	)
	
	type Plugger struct {
		Id      *string
		App     *runtime.App
		Actions *actions_auth.AuthActions
	}
	
		func (c *Plugger) GetServerPublicKey() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.GetServerPublicKey)
		}
		
		func (c *Plugger) GetServersMap() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.GetServersMap)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(app *runtime.App, actions *actions_auth.AuthActions) *Plugger {
		id := "auth"
		return &Plugger{Id: &id, App: app, Actions: actions}
	}
	