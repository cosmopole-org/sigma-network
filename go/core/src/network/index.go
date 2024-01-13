package network

import (
	"fmt"
	"sigma/core/src/core/apps"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"
	"strings"

	"github.com/valyala/fasthttp"
)

type Network struct {
	app *interfaces.IApp
}

func (n Network) fastHTTPHandler(ctx *fasthttp.RequestCtx) {
	var uri = strings.Split(string(ctx.RequestURI()[:]), "?")[0]
	parts := strings.Split(uri, "/")
	service := (*n.app).(interfaces.IApp).GetService(parts[1])
	if service != nil {
		method := service.GetMethod(parts[2])
		if method != nil {
			var temp = method.GetInTemplate()
			var packet = types.CreateWebPacket(ctx)
			if ctx.IsPost() || ctx.IsPut() {
				if utils.ValidateWebPacket(packet, &temp, utils.BODY) {
					method.GetCallback()(n.app, packet, temp)
				}
			} else if ctx.IsGet() {
				if utils.ValidateWebPacket(packet, &temp, utils.QUERY) {
					method.GetCallback()(n.app, packet, temp)
				}
			}
		}
	}
}

func (n Network) Listen(port int) {
	fasthttp.ListenAndServe(fmt.Sprintf(":%d", port), n.fastHTTPHandler)
}

func CreateNetwork() Network {
	fmt.Println("running network...")
	var netInstance = Network{}
	netInstance.app = apps.GetApp()
	return netInstance
}
