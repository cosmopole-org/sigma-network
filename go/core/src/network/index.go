package network

import (
	"fmt"
	"sigma/core/src/core/apps"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"strings"

	"github.com/valyala/fasthttp"
)

var instance Network
func Instance() *Network {
	return &instance
}

type Network struct {
	app *interfaces.IApp
}

func (n Network) fastHTTPHandler(ctx *fasthttp.RequestCtx) {
	var uri = string(ctx.RequestURI()[:])
	parts := strings.Split(uri, "/")
	service := (*n.app).(interfaces.IApp).GetService(parts[1])
	if service != nil {
		method := service.GetMethod(parts[2])
		if method != nil {
			packet := types.CreateWebPacket(ctx)
			method.GetCallback()(n.app, packet)
		}
	}
}
func (n Network) Listen(port int) {
	fasthttp.ListenAndServe(fmt.Sprintf(":%d", port), n.fastHTTPHandler)
}

func CreateNetwork() *Network {
	fmt.Println("running network...")
	var network = Network{}
	network.app = apps.GetApp()
	instance = network
	return &instance
}
