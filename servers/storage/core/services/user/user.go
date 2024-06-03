package controllers_user

import (
	"sigma/storage/core/models"
	"sigma/storage/core/runtime"
	services_user "sigma/storage/core/actions/user"
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
