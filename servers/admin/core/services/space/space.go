package controllers_space

import (
	"sigma/admin/core/models"
	"sigma/admin/core/runtime"
	services_space "sigma/admin/core/actions/space"
)

type Controller struct {
	App *runtime.App
}

func (c *Controller) Create() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_space.Create)
}

func (c *Controller) Update() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_space.Update)
}

func (c *Controller) Delete() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_space.Delete)
}
func (c *Controller) Get() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_space.Get)
}

func (c *Controller) Join() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_space.Join)
}

func (c *Controller) AddMember() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_space.AddMember)
}

func (c *Controller) RemoveMember() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_space.RemoveMember)
}

func (c *Controller) Install() {
	c.App.Adapters().Storage().AutoMigrate(&models.Space{})
	c.App.Adapters().Storage().AutoMigrate(&models.Member{})
	c.App.Adapters().Storage().AutoMigrate(&models.Admin{})
}
