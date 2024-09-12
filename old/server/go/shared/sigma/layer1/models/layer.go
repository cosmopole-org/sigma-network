package models

import "sigma/main/layer1/adapters"

type ISigmaLayer interface {
	Number() int
	PutService(service interface{})
	GenerateState() ISigmaStatePool
	Adapters() *adapters.Adapters
}
