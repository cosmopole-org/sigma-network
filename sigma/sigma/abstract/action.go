package abstract

type IAction interface {
	Key() string
	Act(IState, IInput) (int, any, error)
}
