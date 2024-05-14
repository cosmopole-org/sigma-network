package modules

import (
	"encoding/json"
	"log"
	"sigma/main/core/utils"
	"sigma/main/shell/outputs"

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

func HandleLocalRequest[T IDto, V any](app *App, token string, userOrigin string, m *Method[T, V], data T) (int, any) {
	if m.Check.User {
		var userId, userType = AuthWithToken(app, token)
		var creature = ""
		if userType == 1 {
			creature = "human"
		} else if userType == 2 {
			creature = "machine"
		}
		if userId > 0 {
			if m.Check.Tower {
				var location = HandleLocationWithProcessed(app, token, userId, creature, userOrigin, data.GetTowerId(), data.GetRoomId(), userId)
				if location.TowerId > 0 {
					result, err := m.Callback(Instance(), data, CreateAssistant(userId, creature, location.TowerId, location.RoomId, location.WorkerId, nil))
					if err != nil {
						return fiber.ErrInternalServerError.Code, utils.BuildErrorJson(err.Error())
					}
					return fiber.StatusOK, result
				} else {
					return fiber.StatusForbidden, utils.BuildErrorJson("access denied")
				}
			} else {
				result, err := m.Callback(Instance(), data, CreateAssistant(userId, creature, 0, 0, userId, nil))
				if err != nil {
					return fiber.ErrInternalServerError.Code, utils.BuildErrorJson(err.Error())
				}
				return fiber.StatusOK, result
			}
		} else {
			return fiber.StatusForbidden, utils.BuildErrorJson("access denied")
		}
	} else {
		result, err := m.Callback(Instance(), data, CreateAssistant(0, "", 0, 0, 0, nil))
		if err != nil {
			return fiber.ErrInternalServerError.Code, utils.BuildErrorJson(err.Error())
		}
		return fiber.StatusOK, result
	}
}

func ProcessData[T IDto, V any](origin string, token string, body T, m *Method[T, V]) (int, any) {
	if m.MethodOptions.InFederation {
		if origin == Instance().AppId {
			return HandleLocalRequest[T, V](Instance(), token, app.AppId, m, body)
		} else {
			data, err := json.Marshal(body)
			if err != nil {
				log.Println(err)
				return fiber.ErrInternalServerError.Code, utils.BuildErrorJson((err.Error()))
			}
			reqId, err2 := utils.SecureUniqueString(16)
			if err2 != nil {
				log.Println(err2)
				return fiber.ErrInternalServerError.Code, utils.BuildErrorJson((err2.Error()))
			}
			if m.Check.User {
				var userId, _ = AuthWithToken(Instance(), token)
				if userId > 0 {
					Instance().Memory.SendInFederation(origin, InterfedPacket{IsResponse: false, Key: m.Key, UserId: userId, TowerId: body.GetTowerId(), RoomId: body.GetRoomId(), Data: string(data), RequestId: reqId})
					return fiber.StatusOK, ResponseSimpleMessage{Message: "request to federation queued successfully"}
				} else {
					return fiber.ErrInternalServerError.Code, utils.BuildErrorJson("access denied")
				}
			} else {
				Instance().Memory.SendInFederation(origin, InterfedPacket{IsResponse: false, Key: m.Key, UserId: 0, TowerId: body.GetTowerId(), RoomId: body.GetRoomId(), Data: string(data), RequestId: reqId})
				return fiber.StatusOK, ResponseSimpleMessage{Message: "request to federation queued successfully"}
			}
		}
	} else {
		return HandleLocalRequest[T, V](Instance(), token, app.AppId, m, body)
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
var InterFedOptionsMap = map[string]InterFedOptions{}

func AddGrpcLoader(fn func()) {
	fn()
}

func AddMethod[T IDto, V any](app *App, m *Method[T, V]) {
	Methods[m.Key] = m
	if m.MethodOptions.AsEndpoint {
		AddEndpoint[T, V](m)
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
	Key            string
	Callback       func(*App, interface{}, Assistant) (any, error)
	Check          Check
	MethodOptions  MethodOptions
	ServiceKey     string
	InputFrame     interface{}
	HttpValidation bool
	Dynamic        bool
}

type MethodOptions struct {
	AsEndpoint   bool   `json:"asEndpoint" validate:"required"`
	RestAction   string `json:"restAction" validate:"required"`
	AsGrpc       bool   `json:"asGrpc" validate:"required"`
	InFederation bool   `json:"inFederation" validate:"required"`
}

type InterFedOptions struct {
	ValidateUserAtHome  bool
	ValidateTowerAtHome bool
}

type Check struct {
	User  bool `json:"user" validate:"required"`
	Tower bool `json:"tower" validate:"required"`
	Room  bool `json:"room" validate:"required"`
}

type PluginFunction struct {
	Key  string        `json:"key" validate:"required"`
	Path string        `json:"path" validate:"required"`
	Ch   Check         `json:"ch" validate:"required"`
	Mo   MethodOptions `json:"mo" validate:"required"`
}

func CreateMethod[T any, V any](key string, callback func(*App, T, Assistant) (any, error), inputFrame interface{}, check Check, mOptions MethodOptions, ifOptions InterFedOptions) *Method[T, V] {
	Handlers[key] = func(app *App, dto interface{}, a Assistant) (any, error) {
		return callback(app, dto.(T), a)
	}
	Frames[key] = inputFrame
	Checks[key] = check
	MethodOptionsMap[key] = mOptions
	InterFedOptionsMap[key] = ifOptions
	return &Method[T, V]{Key: key, Callback: Handlers[key], Check: check, MethodOptions: mOptions, InputFrame: inputFrame, HttpValidation: true, Dynamic: false}
}

func CreateNonValidateMethod[T any, V any](key string, callback func(*App, T, Assistant) (any, error), inputFrame interface{}, check Check, mOptions MethodOptions, ifOptions InterFedOptions) *Method[T, V] {
	Handlers[key] = func(app *App, dto interface{}, a Assistant) (any, error) {
		return callback(app, dto.(T), a)
	}
	Frames[key] = inputFrame
	Checks[key] = check
	MethodOptionsMap[key] = mOptions
	InterFedOptionsMap[key] = ifOptions
	return &Method[T, V]{Key: key, Callback: Handlers[key], Check: check, MethodOptions: mOptions, InputFrame: inputFrame, HttpValidation: false, Dynamic: false}
}

func CreateRawMethod[T any, V any](key string, callback func(*App, string, Assistant) (any, error), inputFrame interface{}, check Check, mOptions MethodOptions, ifOptions InterFedOptions) *Method[T, V] {
	Handlers[key] = func(app *App, dto interface{}, a Assistant) (any, error) {
		return callback(app, dto.(string), a)
	}
	Frames[key] = inputFrame
	Checks[key] = check
	MethodOptionsMap[key] = mOptions
	InterFedOptionsMap[key] = ifOptions
	return &Method[T, V]{Key: key, Callback: Handlers[key], Check: check, MethodOptions: mOptions, InputFrame: inputFrame, Dynamic: true}
}

func CreateCheck(user bool, tower bool, room bool) Check {
	return Check{User: user, Tower: tower, Room: room}
}

func CreateMethodOptions(asEndpoint bool, restAction string, asGrpc bool, inFederation bool) MethodOptions {
	return MethodOptions{AsEndpoint: asEndpoint, RestAction: restAction, AsGrpc: asGrpc, InFederation: inFederation}
}

func CreateInterFedOptions(user bool, tower bool) InterFedOptions {
	return InterFedOptions{
		ValidateUserAtHome:  user,
		ValidateTowerAtHome: tower,
	}
}
