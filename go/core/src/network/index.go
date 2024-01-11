package network

import (
	"fmt"
	"strings"

	"github.com/valyala/fasthttp"
)

type Method struct {
	key      string
	callback *func(ctx *fasthttp.RequestCtx)
}

type Service struct {
	key     string
	methods map[string]*Method
}

func (s Service) AddMethod(method *Method) {
	s.methods[method.key] = method
}

func (s Service) GetMethod(key string) *Method {
	return s.methods[key]
}

func (s Service) GetKey() string {
	return s.key
}

type Creature interface {
	GetService(key string) *Service
}

type Network struct {
	app Creature
}

func (n Network) fastHTTPHandler(ctx *fasthttp.RequestCtx) {
	var uri = string(ctx.RequestURI()[:])
	parts := strings.Split(uri, "/")
	service := n.app.GetService(parts[1])
	if service != nil {
		(*service.GetMethod(parts[2]).callback)(ctx)
	}
}
func (n Network) Listen(port int) {
	fasthttp.ListenAndServe(fmt.Sprintf(":%d", port), n.fastHTTPHandler)
}

func CreateNetwork(app Creature) *Network {
	fmt.Println("running network...")
	network := new(Network)
	network.app = app
	return network
}

func CreateService(key string) *Service {
	service := new(Service)
	service.key = key
	service.methods = map[string]*Method{}
	return service
}

func CreateMethod(key string, callback func(ctx *fasthttp.RequestCtx)) *Method {
	method := new(Method)
	method.key = key
	method.callback = &callback
	return method
}
