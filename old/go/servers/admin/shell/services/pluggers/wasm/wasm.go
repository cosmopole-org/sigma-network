
	package pluggers_wasm

	import (
		"sigma/admin/core/runtime"
		actions_wasm "sigma/admin/shell/services/actions/wasm"
	)
	
	type Plugger struct {
		Id      *string
		App     *runtime.App
		Actions *actions_wasm.WasmActions
	}
	
		func (c *Plugger) Plug() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Plug)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(app *runtime.App, actions *actions_wasm.WasmActions) *Plugger {
		id := "wasm"
		return &Plugger{Id: &id, App: app, Actions: actions}
	}
	