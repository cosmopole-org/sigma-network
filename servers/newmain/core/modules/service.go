package modules

import (
	"encoding/json"
	"errors"
	"fmt"
	"sigma/main/core/utils"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type IError struct {
	Field string
	Tag   string
	Value string
}

func ValidateInput[T any](c *fiber.Ctx, actionType string) error {
	var errors []*IError
	body := new(T)
	if actionType == "POST" {
		c.BodyParser(body)
	} else if actionType == "GET" {
		c.QueryParser(body)
	}
	err := utils.Validate.Struct(body)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			var el IError
			el.Field = err.Field()
			el.Tag = err.Tag()
			el.Value = err.Param()
			errors = append(errors, &el)
		}
		return c.Status(fiber.StatusBadRequest).JSON(errors)
	}
	return c.Next()
}

func ProcessData[T any, V any](c *fiber.Ctx, m *Method[T, V], assistant Assistant) error {
	body := new(T)
	if m.MethodOptions.RestAction == "POST" {
		c.BodyParser(body)
	} else if m.MethodOptions.RestAction == "GET" {
		c.QueryParser(body)
	}
	if m.MethodOptions.InFederation {
		originHeader := c.GetReqHeaders()["Origin"]
		if originHeader == nil {
			c.Status(fiber.ErrBadRequest.Code).JSON(utils.BuildErrorJson(("origin not specified")))
			return nil
		}
		origin := originHeader[0]
		if origin == Instance().AppId {
			result, err := m.Callback(Instance(), *body, assistant)
			if err != nil {
				c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err.Error()))
				return nil
			}
			c.Status(fiber.StatusOK).JSON(result)
			return nil
		} else {
			data, err := json.Marshal(body)
			if err != nil {
				fmt.Println(err)
				c.Status(fiber.ErrInternalServerError.Code).JSON(err.Error())
				return nil
			}
			reqId, err2 := utils.SecureUniqueString(16)
			if err2 != nil {
				c.Status(fiber.ErrInternalServerError.Code).JSON(err2.Error())
				return nil
			}
			Instance().Memory.RequestInFederation(origin, InterfedPacket{Key: m.Key, UserId: assistant.UserId, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: string(data), RequestId: reqId})
			c.Status(fiber.StatusOK).JSON(ResponseSimpleMessage{Message: "request to federation queued successfully"})
			return nil
		}
	} else {
		result, err := m.Callback(Instance(), *body, assistant)
		if err != nil {
			c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err.Error()))
			return nil
		}
		c.Status(fiber.StatusOK).JSON(result)
		return nil
	}
}

var Methods = map[string]interface{}{}
var Handlers = map[string]func(*App, interface{}, Assistant) (any, error){}
var Frames = map[string]interface{}{}
var Checks = map[string]Check{}
var MethodOptionsMap = map[string]MethodOptions{}

func AddGrpcLoader(fn func()) {
	fn()
}

func AddMethod[T any, V any](app *App, m *Method[T, V]) {
	Methods[m.Key] = m
	if m.MethodOptions.AsEndpoint {
		app.Network.RestServer.Server.Add(m.MethodOptions.RestAction, m.Key, []fiber.Handler{
			func(c *fiber.Ctx) error {
				return ValidateInput[T](c, m.MethodOptions.RestAction)
			},
			func(c *fiber.Ctx) error {
				if m.Check.User {
					tokenHeader := c.GetReqHeaders()["Token"]
					if tokenHeader == nil {
						err := errors.New("authorization token is not supplied")
						c.Status(fiber.ErrInternalServerError.Code).JSON(err)
						return err
					}
					token := tokenHeader[0]
					var userId, _ = AuthWithToken(app, token)
					if userId > 0 {
						return ProcessData[T, V](c, m, CreateAssistant(userId, "human", 0, 0, 0, nil))
					} else {
						err := errors.New("access denied")
						c.Status(fiber.StatusForbidden).JSON(err)
						return err
					}
				} else {
					return ProcessData[T, V](c, m, CreateAssistant(0, "", 0, 0, 0, nil))
				}
			},
		}...)
	}
}

func GetMethod[T any, V any](key string) *Method[T, V] {
	return Methods[key].(*Method[T, V])
}

func CallMethod[T any, V any](key string, dto interface{}, meta *Meta) (any, error) {
	var method = GetMethod[T, V](key)
	return method.Callback(Instance(), dto, CreateAssistant(meta.UserId, "human", meta.TowerId, meta.RoomId, 0, nil))
}

type Method[T any, V any] struct {
	Key           string
	Callback      func(*App, interface{}, Assistant) (any, error)
	Check         Check
	MethodOptions MethodOptions
	ServiceKey    string
	InputFrame    interface{}
}

type MethodOptions struct {
	AsEndpoint   bool
	RestAction   string
	AsGrpc       bool
	InFederation bool
}

type Check struct {
	User  bool
	Tower bool
	Room  bool
}

func CreateMethod[T any, V any](key string, callback func(*App, T, Assistant) (any, error), inputFrame interface{}, check Check, mOptions MethodOptions) *Method[T, V] {
	Handlers[key] = func(app *App, dto interface{}, a Assistant) (any, error) {
		return callback(app, dto.(T), a)
	}
	Frames[key] = inputFrame
	Checks[key] = check
	MethodOptionsMap[key] = mOptions
	return &Method[T, V]{Key: key, Callback: Handlers[key], Check: check, MethodOptions: mOptions, InputFrame: inputFrame}
}

func CreateCheck(user bool, tower bool, room bool) Check {
	return Check{User: user, Tower: tower, Room: room}
}

func CreateMethodOptions(asEndpoint bool, restAction string, asGrpc bool, inFederation bool) MethodOptions {
	return MethodOptions{AsEndpoint: asEndpoint, RestAction: restAction, AsGrpc: asGrpc, InFederation: inFederation}
}
