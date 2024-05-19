package main

import (
	"encoding/json"
	"fmt"
)

// hello

func hello(c Hello) any {
	fmt.Println("hello " + c.Content1)
	return nil
}

type Hello struct {
	Content1 string
}

// bye

func bye(c Bye) any {
	fmt.Println("bye " + c.Content2)
	return nil
}

type Bye struct {
	Content2 string
}

// base

type Action struct {
	Process func(string) any
}

func CreateAction[T any](fn func(T) any) Action {
	return Action{Process: func(rawStr string) any {
		frame := new(T)
		json.Unmarshal([]byte(rawStr), frame)
		return fn(*frame)
	}}
}

type Services struct {
	Actions map[string]Action
}

func (ss *Services) RunAction(key string, input string) any {
	return ss.Actions[key].Process(input)
}

func (ss *Services) AddAction(key string, action Action) {
	ss.Actions[key] = action
}

func main() {
	services := Services{Actions: map[string]Action{}}
	services2 := Services{Actions: map[string]Action{}}
	services.AddAction("hello", CreateAction(hello))
	services2.AddAction("bye", CreateAction(bye))
	services.RunAction("hello", `{ "Content1": "world 1" }`)
	services2.RunAction("bye", `{ "Content2": "world 2" }`)
}
