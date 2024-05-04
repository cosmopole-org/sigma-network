package modules

import (
	"encoding/json"
	"errors"
	"fmt"
	"sigma/main/core/outputs"
	"sigma/main/core/utils"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
)

type IError struct {
	Field string
	Tag   string
	Value string
}

func ValidateInput[T any](c *fiber.Ctx, actionType string) error {
	var errors []*IError
	body := new(T)
	if actionType == "POST" || actionType == "PUT" || actionType == "DELETE" {
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
	form, err := c.MultipartForm()
	if err == nil {
		var formData = map[string]any{}
		for k, v := range form.Value {
			formData[k] = v
		}
		for k, v := range form.File {
			formData[k] = v
		}
		err2 := mapstructure.Decode(formData, body)
		if err2 != nil {
			return c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err2.Error()))
		}
		result, err3 := m.Callback(Instance(), *body, assistant)
		if err3 != nil {
			return c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err3.Error()))
		}
		return HandleResutOfFunc(c, result)
	}
	if m.MethodOptions.RestAction == "POST" {
		c.BodyParser(body)
	} else if m.MethodOptions.RestAction == "GET" {
		c.QueryParser(body)
	}
	if m.MethodOptions.InFederation {
		originHeader := c.GetReqHeaders()["Origin"]
		if originHeader == nil {
			return c.Status(fiber.ErrBadRequest.Code).JSON(utils.BuildErrorJson(("origin not specified")))
		}
		origin := originHeader[0]
		if origin == Instance().AppId {
			result, err := m.Callback(Instance(), *body, assistant)
			if err != nil {
				return c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err.Error()))
			}
			return HandleResutOfFunc(c, result)
		} else {
			data, err := json.Marshal(body)
			if err != nil {
				fmt.Println(err)
				return c.Status(fiber.ErrInternalServerError.Code).JSON(err.Error())
			}
			reqId, err2 := utils.SecureUniqueString(16)
			if err2 != nil {
				return c.Status(fiber.ErrInternalServerError.Code).JSON(err2.Error())
			}
			Instance().Memory.SendInFederation(origin, InterfedPacket{IsResponse: false, Key: m.Key, UserId: assistant.UserId, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: string(data), RequestId: reqId})
			return c.Status(fiber.StatusOK).JSON(ResponseSimpleMessage{Message: "request to federation queued successfully"})
		}
	} else {
		result, err := m.Callback(Instance(), *body, assistant)
		if err != nil {
			return c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err.Error()))
		}
		return HandleResutOfFunc(c, result)
	}
}

func HandleResutOfFunc(c *fiber.Ctx, result any) error {
	switch result := result.(type) {
	case outputs.Command:
		if result.Value == "sendFile" {
			return c.Status(fiber.StatusOK).SendFile(result.Data)
		} else {
			return c.Status(fiber.StatusOK).JSON(result)
		}
	default:
		return c.Status(fiber.StatusOK).JSON(result)
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
				if m.Check.User {
					tokenHeader := c.GetReqHeaders()["Token"]
					if tokenHeader == nil {
						return c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson("authorization token is not supplied"))
					}
					token := tokenHeader[0]
					var userId, userType = AuthWithToken(app, token)
					var creature = ""
					if userType == 1 {
						creature = "human"
					} else if userType == 2 {
						creature = "machine"
					}
					if userId > 0 {
						if m.Check.Tower {
							var location = HandleLocation(app, token, userId, creature, c.GetReqHeaders())
							if location.TowerId > 0 {
								return ProcessData[T, V](c, m, CreateAssistant(userId, creature, location.TowerId, location.RoomId, location.WorkerId, nil))
							} else {
								return c.Status(fiber.ErrForbidden.Code).JSON(utils.BuildErrorJson("access denied"))
							}
						} else {
							return ProcessData[T, V](c, m, CreateAssistant(userId, creature, 0, 0, userId, nil))
						}
					} else {
						err := errors.New("access denied")
						return c.Status(fiber.StatusForbidden).JSON(err)
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
