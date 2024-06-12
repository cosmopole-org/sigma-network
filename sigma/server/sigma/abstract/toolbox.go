package abstract

type IToolbox interface {
}

func UseToolbox[T IToolbox](t any) T {
	return t.(T)
}
