package module_model

type Listener struct {
	Id     string
	Signal func(any)
}

type GlobalListener struct {
	Signal func(string, any)
}
