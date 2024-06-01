package models

type Listener struct {
	Id     string
	Signal func(any)
}
