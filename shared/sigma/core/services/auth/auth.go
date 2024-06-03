package controllers_user

import (
	"sigma/main/core/runtime"
	services_auth "sigma/main/core/actions/auth"
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
