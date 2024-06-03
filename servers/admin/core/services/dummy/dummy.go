package controllers_dummy

import (
	"sigma/admin/core/runtime"
	services_dummy "sigma/admin/core/actions/dummy"
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
