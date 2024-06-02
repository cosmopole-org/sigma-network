package models

type Listener struct {
	Id     string
	Signal func(any)
}

type GlobalListener struct {
	Signal func(string, any)
}
