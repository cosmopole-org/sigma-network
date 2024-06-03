package controllers_invite

import (
	"sigma/admin/core/models"
	"sigma/admin/core/runtime"
	services_invite "sigma/admin/core/actions/invite"
)

type Controller struct {
	App *runtime.App
}

func (c *Controller) Create() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_invite.Create)
}

func (c *Controller) Cancel() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_invite.Cancel)
}

func (c *Controller) Accept() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_invite.Accept)
}

func (c *Controller) Decline() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_invite.Decline)
}

func (c *Controller) Install() {
	c.App.Adapters().Storage().AutoMigrate(&models.Invite{})
}
