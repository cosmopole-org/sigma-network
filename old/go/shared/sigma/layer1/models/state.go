package models

type ISigmaState interface {
	Id() string
}

type ISigmaStatePool interface {
	GetState(string) ISigmaState
}

func UseState[T ISigmaState](state ISigmaStatePool, stateId string) T {
	return state.GetState(stateId).(T)
}
