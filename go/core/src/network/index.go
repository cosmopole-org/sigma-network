package network

import (
	"fmt"
	"strings"

	"sigma/core/src/types"

	"github.com/valyala/fasthttp"
)

type Network struct {
	app types.IApp
}

func (n Network) fastHTTPHandler(ctx *fasthttp.RequestCtx) {
	var uri = string(ctx.RequestURI()[:])
	parts := strings.Split(uri, "/")
	service := n.app.GetService(parts[1])
	if service != nil {
		method := service.GetMethod(parts[2])
		if method != nil {
			packet := types.CreateWebPacket(ctx)
			(*method.GetCallback())(&packet)
		}
	}
}
func (n Network) Listen(port int) {
	fasthttp.ListenAndServe(fmt.Sprintf(":%d", port), n.fastHTTPHandler)
}

func CreateNetwork(app types.IApp) *Network {
	fmt.Println("running network...")
	network := new(Network)
	network.app = app
	return network
}
