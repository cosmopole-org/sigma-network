package modules

import (
	"sigma/main/core/utils"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type IError struct {
	Field string
	Tag   string
	Value string
}

func ValidateInput[T any](body T) []*IError {
	var errors []*IError
	err := utils.Validate.Struct(body)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			var el IError
			el.Field = err.Field()
			el.Tag = err.Tag()
			el.Value = err.Param()
			errors = append(errors, &el)
		}
		return errors
	}
	return []*IError{}
}

func HandleLocalRequest[T IDto, V any](app *App, token string, userOrigin string, m *Method[T, V], data T, ctx *fiber.Ctx) (int, any) {
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
				var location = HandleLocationWithProcessed(app, token, userId, creature, userOrigin, data.GetTowerId(), data.GetRoomId(), data.GetWorkerId())
				if location.TowerId > 0 {
					result, err := m.Callback(Instance(), data, CreateAssistant(userId, userOrigin, creature, location.TowerId, location.RoomId, location.WorkerId, ctx))
					if err != nil {
						return fiber.ErrInternalServerError.Code, utils.BuildErrorJson(err.Error())
					}
					return fiber.StatusOK, result
				} else {
					return fiber.StatusForbidden, utils.BuildErrorJson("access denied")
				}
			} else {
				result, err := m.Callback(Instance(), data, CreateAssistant(userId, userOrigin, creature, 0, 0, userId, ctx))
				if err != nil {
					return fiber.ErrInternalServerError.Code, utils.BuildErrorJson(err.Error())
				}
				return fiber.StatusOK, result
			}
		} else {
			return fiber.StatusForbidden, utils.BuildErrorJson("access denied")
		}
	} else {
		result, err := m.Callback(Instance(), data, CreateAssistant(0, "", "", 0, 0, 0, ctx))
		if err != nil {
			return fiber.ErrInternalServerError.Code, utils.BuildErrorJson(err.Error())
		}
		return fiber.StatusOK, result
	}
}

func ProcessData[T IDto, V any](origin string, token string, body T, reqId string, m *Method[T, V], ctx *fiber.Ctx) (int, any) {
	org := app.AppId
	if origin != "" {
		org = origin
	}
	if m.MethodOptions.Fed {
		if org == Instance().AppId {
			return HandleLocalRequest[T, V](Instance(), token, app.AppId, m, body, ctx)
		} else {
			if m.Check.User {
				var userId, _ = AuthWithToken(Instance(), token)
				if userId > 0 {
					return -2, userId
				} else {
					return fiber.ErrInternalServerError.Code, utils.BuildErrorJson("access denied")
				}
			} else {
				return -2, 0
			}
		}
	} else {
		return HandleLocalRequest[T, V](Instance(), token, app.AppId, m, body, ctx)
	}
}

var Methods = map[string]interface{}{}
var Handlers = map[string]func(*App, interface{}, Assistant) (any, error){}
var Frames = map[string]interface{}{}
var Checks = map[string]Check{}
var MethodOptionsMap = map[string]AccessOptions{}
var InterFedOptionsMap = map[string]InterFedOptions{}

func AddGrpcLoader(fn func()) {
	fn()
}

func AddMethod[T IDto, V any](key string, callback func(*App, T, Assistant) (any, error), ck Check, ao AccessOptions) *Method[T, V] {
	m := &Method[T, V]{Key: key, Callback: callback, Check: ck, MethodOptions: ao}
	Methods[m.Key] = m
	Handlers[m.Key] = func(app *App, dto interface{}, a Assistant) (any, error) {
		return m.Callback(app, dto.(T), a)
	}
	Frames[m.Key] = *new(T)
	Checks[m.Key] = m.Check
	MethodOptionsMap[m.Key] = m.MethodOptions
	return m
}

func GetMethod[T IDto, V any](key string) *Method[T, V] {
	return Methods[key].(*Method[T, V])
}

func CallMethod[T IDto, V any](key string, dto T, meta *Meta) (any, error) {
	var method = GetMethod[T, V](key)
	return method.Callback(Instance(), dto, CreateAssistant(meta.UserId, app.AppId, "human", meta.TowerId, meta.RoomId, 0, nil))
}

type Method[T IDto, V any] struct {
	Key            string
	Callback       func(*App, T, Assistant) (any, error)
	Check          Check
	MethodOptions  AccessOptions
	ServiceKey     string
	InputFrame     interface{}
	HttpValidation bool
	Dynamic        bool
}

type AccessOptions struct {
	Http   bool   `json:"http" validate:"required"`
	Action string `json:"action" validate:"required"`
	Ws     bool   `json:"ws" validate:"required"`
	Grpc   bool   `json:"grpc" validate:"required"`
	Fed    bool   `json:"fed" validate:"required"`
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
	Mo   AccessOptions `json:"mo" validate:"required"`
}

func CreateCk(user bool, tower bool, room bool) Check {
	return Check{User: user, Tower: tower, Room: room}
}

func CreateAc(http bool, action string, ws bool, grpc bool, fed bool) AccessOptions {
	return AccessOptions{Http: http, Action: action, Ws: ws, Grpc: grpc, Fed: fed}
}

func CreateFn[T IDto](f func(*App, T, Assistant) (any, error)) func (app *App, dto interface{}, a Assistant) (any, error) {
	return func (app *App, dto interface{}, a Assistant) (any, error)  {
		return f(app, dto.(T), a)
	}
}
