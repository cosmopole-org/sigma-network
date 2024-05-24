package modules

import (
	"encoding/json"
	"errors"
	"sigma/admin/core/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
)

type IError struct {
	Field string
	Tag   string
	Value string
}

type Action struct {
	Key               string
	Check             Check
	Access            Access
	Validate          bool
	Process           func(*App, interface{}, string, string) (int, any, error)
	ProcessHonestly   func(*App, interface{}, Meta) (int, any, error)
	ProcessFederative func(*App, interface{}, Assistant) (int, any, error)
}

type Access struct {
	Http       bool   `json:"http" validate:"required"`
	ActionType string `json:"actionType" validate:"required"`
	Ws         bool   `json:"ws" validate:"required"`
	Grpc       bool   `json:"grpc" validate:"required"`
	Fed        bool   `json:"fed" validate:"required"`
}

type Check struct {
	User  bool `json:"user" validate:"required"`
	Tower bool `json:"tower" validate:"required"`
	Room  bool `json:"room" validate:"required"`
}

type Services struct {
	Actions map[string]*Action
}

func (ss *Services) CallAction(key string, input interface{}, token string, origin string) (int, any, error) {
	return ss.Actions[key].Process(GetApp(), input, token, origin)
}

func (ss *Services) CallActionHonestly(key string, input interface{}, m Meta) (int, any, error) {
	return ss.Actions[key].ProcessHonestly(GetApp(), input, m)
}

func (ss *Services) AddAction(action *Action) {
	ss.Actions[action.Key] = action
}

func (ss *Services) GetAction(key string) *Action {
	return ss.Actions[key]
}

func ValidateInput[T any](body T) error {
	return utils.Validate.Struct(body)
}

func AddGrpcLoader(fn func()) {
	fn()
}

func CreateCk(user bool, tower bool, room bool) Check {
	return Check{User: user, Tower: tower, Room: room}
}

func CreateAc(http bool, ws bool, grpc bool, fed bool, actionType string) Access {
	return Access{Http: http, Ws: ws, Grpc: grpc, Fed: fed, ActionType: actionType}
}

type PreFedPacket struct {
	UserId int64
	Body   any
}

type PluginFunction struct {
	Key    string `json:"key" validate:"required"`
	Path   string `json:"path" validate:"required"`
	Check  Check  `json:"check" validate:"required"`
	Access Access `json:"access" validate:"required"`
}

func CreateAction[T IDto](key string, check Check, access Access, Validate bool, callback func(*App, T, Assistant) (any, error)) *Action {
	return &Action{
		Key:    key,
		Access: access,
		Check:  check,
		Process: func(app *App, rawInput interface{}, token string, origin string) (int, any, error) {
			data := new(T)
			var ctx *fiber.Ctx
			switch input := rawInput.(type) {
			case string:
				json.Unmarshal([]byte(input), data)
			case *fiber.Ctx:
				ctx = input
				form, err := input.MultipartForm()
				if err == nil {
					var formData = map[string]any{}
					for k, v := range form.Value {
						formData[k] = v
					}
					for k, v := range form.File {
						formData[k] = v
					}
					mapstructure.Decode(formData, data)
				} else {
					if access.ActionType == "POST" || access.ActionType == "PUT" || access.ActionType == "DELETE" {
						input.BodyParser(data)
					} else if access.ActionType == "GET" {
						input.QueryParser(data)
					}
				}
			default:
				//pass
			}
			err := ValidateInput(*data)
			if err != nil {
				return fiber.ErrBadRequest.Code, nil, err
			}
			if origin == "" {
				origin = app.AppId
			}
			if !access.Fed || (origin == app.AppId) {
				if check.User {
					var userId, userType = AuthWithToken(app, token)
					var creature = ""
					if userType == 1 {
						creature = "human"
					} else if userType == 2 {
						creature = "machine"
					}
					if userId > 0 {
						if check.Tower {
							var location = HandleLocationWithProcessed(app, token, userId, creature, origin, (*data).GetTowerId(), (*data).GetRoomId(), (*data).GetWorkerId())
							if location.TowerId > 0 {
								result, err := callback(GetApp(), (*data), CreateAssistant(userId, origin, creature, location.TowerId, location.RoomId, location.WorkerId, ctx))
								if err != nil {
									return fiber.ErrInternalServerError.Code, nil, err
								}
								return fiber.StatusOK, result, nil
							} else {
								return fiber.StatusForbidden, nil, errors.New("access denied")
							}
						} else {
							result, err := callback(GetApp(), *data, CreateAssistant(userId, origin, creature, 0, 0, userId, ctx))
							if err != nil {
								return fiber.ErrInternalServerError.Code, nil, err
							}
							return fiber.StatusOK, result, nil
						}
					} else {
						return fiber.StatusForbidden, nil, errors.New("access denied")
					}
				} else {
					result, err := callback(GetApp(), *data, CreateAssistant(0, "", "", 0, 0, 0, ctx))
					if err != nil {
						return fiber.ErrInternalServerError.Code, nil, err
					}
					return fiber.StatusOK, result, nil
				}
			} else {
				if check.User {
					var userId, _ = AuthWithToken(GetApp(), token)
					if userId > 0 {
						return -2, PreFedPacket{UserId: userId, Body: *data}, nil
					} else {
						return fiber.ErrInternalServerError.Code, nil, errors.New("access denied")
					}
				} else {
					return -2, PreFedPacket{UserId: 0, Body: *data}, nil
				}
			}
		},
		ProcessHonestly: func(app *App, data interface{}, m Meta) (int, any, error) {
			result, err := callback(GetApp(), data.(T), CreateAssistant(m.UserId, app.AppId, "human", m.TowerId, m.RoomId, 0, nil))
			if err != nil {
				return fiber.ErrInternalServerError.Code, nil, err
			}
			return fiber.StatusOK, result, nil
		},
		ProcessFederative: func(app *App, data interface{}, a Assistant) (int, any, error) {
			result, err := callback(GetApp(), data.(T), a)
			if err != nil {
				return fiber.ErrInternalServerError.Code, nil, err
			}
			return fiber.StatusOK, result, nil
		},
	}
}

func CreateServices() *Services {
	return &Services{
		Actions: map[string]*Action{},
	}
}
