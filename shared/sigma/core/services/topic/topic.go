package controllers_topic

import (
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	services_topic "sigma/main/core/actions/topic"
)

type Controller struct {
	App *runtime.App
}

func (c *Controller) Create() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_topic.Create)
}

func (c *Controller) Update() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_topic.Update)
}

func (c *Controller) Delete() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_topic.Delete)
}
func (c *Controller) Get() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_topic.Get)
}

func (c *Controller) Send() *runtime.Action {
	return runtime.ExtractFunction(c.App, services_topic.Send)
}

func (c *Controller) Install() {
	c.App.Adapters().Storage().AutoMigrate(&models.Topic{})
}
