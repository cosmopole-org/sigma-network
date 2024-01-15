package network

import (
	"context"
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

func (n Network) authenticate(packet types.WebPacket) int64 {
	var query = `
		select user_id from session where token = $1 limit 1
	`
	var id int64 = 0
	if err := (*n.app).GetDatabase().GetDb().QueryRow(context.Background(), query, packet.GetHeader("token")).
		Scan(&id); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusForbidden, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return 0
	} else {
		return id
	}
}

func (n Network) fastHTTPHandler(ctx *fasthttp.RequestCtx) {
	var uri = strings.Split(string(ctx.RequestURI()[:]), "?")[0]
	parts := strings.Split(uri, "/")
	service := (*n.app).(interfaces.IApp).GetService(parts[1])
	if service != nil {
		method := service.GetMethod(parts[2])
		if method != nil {
			var temp = method.GetInTemplate()
			var packet = types.CreateWebPacket(ctx).(types.WebPacket)
			if ctx.IsPost() || ctx.IsPut() {
				if utils.ValidateWebPacket(packet, &temp, utils.BODY) {
					if method.GetCheck().NeedUser() {
						var userId = n.authenticate(packet)
						if userId > 0 {
							method.GetCallback()(n.app, packet, temp, types.CreateGuard(userId, 0, 0))
						}
					} else {
						method.GetCallback()(n.app, packet, temp, types.CreateGuard(0, 0, 0))
					}
				}
			} else if ctx.IsGet() {
				if utils.ValidateWebPacket(packet, &temp, utils.QUERY) {
					if method.GetCheck().NeedUser() {
						var userId = n.authenticate(packet)
						if userId > 0 {
							method.GetCallback()(n.app, packet, temp, types.CreateGuard(userId, 0, 0))
						}
					} else {
						method.GetCallback()(n.app, packet, temp, types.CreateGuard(0, 0, 0))
					}
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
