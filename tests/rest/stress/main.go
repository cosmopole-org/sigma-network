package main

import "fmt"

type Hello struct {
	Content1 string
}

func (h *Hello) GetContent() string {
	return h.Content1
}

type Bye struct {
	Content2 string
}

func (b *Bye) GetContent() string {
	return b.Content2
}

type Packet interface {
	*Hello | *Bye
	GetContent() string
}

func ExtractPacket[T Packet](x T) string {
	return x.GetContent()
}

type Action struct {
	Process func(interface{})
}

type Services struct {
	Actions map[string]Action
}

func hello(c Hello) {
	fmt.Println(c.GetContent())
}

func (ss *Services) RunAction(key string, input interface{}) {
	ss.Actions["hello"].Process(input)
}

func main() {
	services := Services{Actions: map[string]Action{}}
	action1 := Action{Process: func(raw interface{}) {
		hello(raw.(Hello))
	}}
	services.Actions["hello"] = action1
	services.RunAction("hello", Hello{Content1: "test world !"})
}
