package abstract

type IState interface {
	Dummy() string
}

type IStateBuilder interface {
	NewState(...interface{}) IState
}

func UseState[T IState](s any) T {
	return s.(T)
}
