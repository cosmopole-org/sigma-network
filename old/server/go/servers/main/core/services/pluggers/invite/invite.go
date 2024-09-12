
	package pluggers_invite

	import (
		"sigma/main/core/runtime"
		actions_invite "sigma/main/core/services/actions/invite"
	)
	
	type Plugger struct {
		Id      *string
		App     *runtime.App
		Actions *actions_invite.InviteActions
	}
	
		func (c *Plugger) Create() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Create)
		}
		
		func (c *Plugger) Cancel() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Cancel)
		}
		
		func (c *Plugger) Accept() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Accept)
		}
		
		func (c *Plugger) Decline() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Decline)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(app *runtime.App, actions *actions_invite.InviteActions) *Plugger {
		id := "invite"
		return &Plugger{Id: &id, App: app, Actions: actions}
	}
	