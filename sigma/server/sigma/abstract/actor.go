package abstract

type IActor interface {
	InjectAction(IAction)
	InjectService(interface{})
	FetchAction(string) IAction
}
