
	package pluggers_dummy

	import (
		"sigma/storage/core/runtime"
		actions_dummy "sigma/storage/core/services/actions/dummy"
	)
	
	type Plugger struct {
		Id      *string
		App     *runtime.App
		Actions *actions_dummy.DummyActions
	}
	
		func (c *Plugger) Hello() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Hello)
		}
		
		func (c *Plugger) Ping() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Ping)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(app *runtime.App, actions *actions_dummy.DummyActions) *Plugger {
		id := "dummy"
		return &Plugger{Id: &id, App: app, Actions: actions}
	}
	