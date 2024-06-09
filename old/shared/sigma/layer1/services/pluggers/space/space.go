
	package pluggers_space

	import (
		"sigma/main/core/runtime"
		actions_space "sigma/main/core/services/actions/space"
	)
	
	type Plugger struct {
		Id      *string
		App     *runtime.App
		Actions *actions_space.SpaceActions
	}
	
		func (c *Plugger) AddMember() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.AddMember)
		}
		
		func (c *Plugger) RemoveMember() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.RemoveMember)
		}
		
		func (c *Plugger) Create() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Create)
		}
		
		func (c *Plugger) Update() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Update)
		}
		
		func (c *Plugger) Delete() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Delete)
		}
		
		func (c *Plugger) Get() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Get)
		}
		
		func (c *Plugger) Join() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Join)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(app *runtime.App, actions *actions_space.SpaceActions) *Plugger {
		id := "space"
		return &Plugger{Id: &id, App: app, Actions: actions}
	}
	