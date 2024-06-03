package controllers_user

import (
	"sigma/admin/core/runtime"
	services_auth "sigma/admin/core/actions/auth"
)

type Controller struct {
	App *runtime.App
}

func (c *Controller) GetServerPublicKey() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_auth.GetServerPublicKey)
}

func (c *Controller) GetServersMap() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_auth.GetServersMap)
}

func (c *Controller) Install() {
	// pass
}
