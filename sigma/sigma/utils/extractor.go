package utils

import (
	"github.com/gofiber/fiber/v2"
	"sigma/sigma/abstract"
	moduleactormodel "sigma/sigma/core/module/actor/model"
	module_logger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/module/actor"
	net_federation "sigma/sigma/layer3/tools/network/federation"
	net_grpc "sigma/sigma/layer3/tools/network/grpc"
	net_http "sigma/sigma/layer3/tools/network/http"
	net_pusher "sigma/sigma/layer3/tools/network/push"
	"strings"
)

func ExtractAction[T abstract.IInput](actionFunc func(abstract.IState, T) (any, error)) abstract.IAction {
	key, _ := ExtractActionMetadata(actionFunc)
	action := moduleactormodel.NewAction(key, func(state abstract.IState, input abstract.IInput) (any, error) {
		return actionFunc(state, input.(T))
	})
	return action
}

func ExtractSecureAction[T abstract.IInput](logger *module_logger.Logger, core abstract.ICore, actionFunc func(abstract.IState, T) (any, error)) abstract.IAction {
	key, guard := ExtractActionMetadata(actionFunc)
	action := moduleactormodel.NewAction(key, func(state abstract.IState, input abstract.IInput) (any, error) {
		return actionFunc(state, input.(T))
	})
	return actor.NewSecureAction(action, guard, core, logger, map[string]actor.Parse{
		"http": func(i interface{}) (abstract.IInput, error) {
			return net_http.ParseInput[T](i.(*fiber.Ctx))
		},
		"push": func(i interface{}) (abstract.IInput, error) {
			return net_pusher.ParseInput[T](i.(string))
		},
		"grpc": func(i interface{}) (abstract.IInput, error) {
			return net_grpc.ParseInput[T](i)
		},
		"fed": func(i interface{}) (abstract.IInput, error) {
			return net_federation.ParseInput[T](i.(string))
		},
	})
}

func ExtractActionMetadata(function interface{}) (string, *actor.Guard) {
	var ts = strings.Split(FuncDescription(function), " ")
	var tokens []string
	for _, token := range ts {
		if len(strings.Trim(token, " ")) > 0 {
			tokens = append(tokens, token)
		}
	}
	var key = tokens[0]
	var guard *actor.Guard
	if tokens[1] == "check" && tokens[2] == "[" && tokens[6] == "]" {
		guard = &actor.Guard{IsUser: tokens[3] == "true", IsInSpace: tokens[4] == "true", IsInTopic: tokens[5] == "true"}
		//if tokens[7] == "access" && tokens[8] == "[" && tokens[14] == "]" {
		//	access = Access{Http: tokens[9] == "true", Ws: tokens[10] == "true", Grpc: tokens[11] == "true", Fed: tokens[12] == "true", ActionType: tokens[13]}
		//}
	}
	return key, guard
}
