
	package pluggers_user

	import (
		"sigma/admin/core/runtime"
		actions_user "sigma/admin/core/services/actions/user"
	)
	
	type Plugger struct {
		Id      *string
		App     *runtime.App
		Actions *actions_user.UserActions
	}
	
		func (c *Plugger) Authenticate() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Authenticate)
		}
		
		func (c *Plugger) Create() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Create)
		}
		
		func (c *Plugger) Update() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Update)
		}
		
		func (c *Plugger) Get() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Get)
		}
		
		func (c *Plugger) Delete() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Delete)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(app *runtime.App, actions *actions_user.UserActions) *Plugger {
		id := "user"
		return &Plugger{Id: &id, App: app, Actions: actions}
	}
	