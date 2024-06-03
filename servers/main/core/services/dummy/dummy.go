package controllers_dummy

import (
	"sigma/main/core/runtime"
	services_dummy "sigma/main/core/actions/dummy"
)

type Controller struct {
	App *runtime.App
}

func (c *Controller) Hello() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_dummy.Hello)
}

func (c *Controller) Ping() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_dummy.Ping)
}

func (c *Controller) Install() {
	// pass
}
