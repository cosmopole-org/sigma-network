package controllers_user

import (
	"sigma/admin/core/models"
	"sigma/admin/core/runtime"
	services_user "sigma/admin/core/actions/user"
)

type Controller struct {
	App *runtime.App
}

func (c *Controller) Authenticate() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_user.Authenticate)
}

func (c *Controller) Create() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_user.Create)
}

func (c *Controller) Update() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_user.Update)
}

func (c *Controller) Delete() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_user.Delete)
}

func (c *Controller) Get() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_user.Get)
}

func (c *Controller) Install() {
	c.App.Adapters().Storage().AutoMigrate(&models.Session{})
	c.App.Adapters().Storage().AutoMigrate(&models.User{})
}
