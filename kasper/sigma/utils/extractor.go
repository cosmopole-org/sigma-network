package utils

import (
	"encoding/json"
	"sigma/sigma/abstract"
	moduleactormodel "sigma/sigma/core/module/actor/model"
	module_logger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/module/actor"
	net_federation "sigma/sigma/layer3/tools/network/federation"
	net_grpc "sigma/sigma/layer3/tools/network/grpc"
	net_http "sigma/sigma/layer3/tools/network/http"
	net_pusher "sigma/sigma/layer3/tools/network/push"
	"sigma/sigma/utils/vaidate"
	"strings"

	"github.com/gofiber/fiber/v2"
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
		"default": func(i interface{}) (abstract.IInput, error) {
			input := new(T)
			err := json.Unmarshal([]byte(i.(string)), input)
			if err == nil {
				err2 := vaidate.Validate.Struct(input)
				if err2 == nil {
					return *input, nil
				}
				return nil, err2
			}
			return nil, err
		},
		"http": func(i interface{}) (abstract.IInput, error) {
			input, err := net_http.ParseInput[T](i.(*fiber.Ctx))
			if err == nil {
				err2 := vaidate.Validate.Struct(input)
				if err2 == nil {
					return input, nil
				}
				return nil, err2
			}
			return nil, err
		},
		"push": func(i interface{}) (abstract.IInput, error) {
			input, err := net_pusher.ParseInput[T](i.(string))
			if err == nil {
				err2 := vaidate.Validate.Struct(input)
				if err2 == nil {
					return input, nil
				}
				return nil, err2
			}
			return nil, err
		},
		"grpc": func(i interface{}) (abstract.IInput, error) {
			input, err := net_grpc.ParseInput[T](i)
			if err == nil {
				err2 := vaidate.Validate.Struct(input)
				if err2 == nil {
					return input, nil
				}
				return nil, err2
			}
			return nil, err
		},
		"fed": func(i interface{}) (abstract.IInput, error) {
			input, err := net_federation.ParseInput[T](i.(string))
			if err == nil {
				err2 := vaidate.Validate.Struct(input)
				if err2 == nil {
					return input, nil
				}
				return nil, err2
			}
			return nil, err
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
