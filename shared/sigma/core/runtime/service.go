package runtime

import (
	"encoding/json"
	"errors"
	"sigma/main/core/inputs"
	"sigma/main/core/models"
	"sigma/main/core/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
)

type Meta struct {
	UserId  int64
	SpaceId int64
	TopicId int64
}

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
	ProcessFederative func(*App, interface{}, models.Info) (int, any, error)
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
	Space bool `json:"space" validate:"required"`
	Topic bool `json:"topic" validate:"required"`
}

type Services struct {
	app     *App
	Actions map[string]*Action
}

func (ss *Services) CallAction(key string, input interface{}, token string, origin string) (int, any, error) {
	return ss.Actions[key].Process(ss.app, input, token, origin)
}

func (ss *Services) CallActionHonestly(key string, input interface{}, m Meta) (int, any, error) {
	return ss.Actions[key].ProcessHonestly(ss.app, input, m)
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

func CreateCk(user bool, space bool, topic bool) Check {
	return Check{User: user, Space: space, Topic: topic}
}

func CreateAc(http bool, ws bool, grpc bool, fed bool, actionType string) Access {
	return Access{Http: http, Ws: ws, Grpc: grpc, Fed: fed, ActionType: actionType}
}

type PreFedPacket struct {
	UserId string
	Body   any
}

type PluginFunction struct {
	Key    string `json:"key" validate:"required"`
	Path   string `json:"path" validate:"required"`
	Check  Check  `json:"check" validate:"required"`
	Access Access `json:"access" validate:"required"`
}

func CreateAction[T inputs.IInput](app *App, key string, check Check, access Access, Validate bool, callback func(*App, T, models.Info) (any, error)) *Action {
	return &Action{
		Key:    key,
		Access: access,
		Check:  check,
		Process: func(app *App, rawInput interface{}, token string, origin string) (int, any, error) {
			data := new(T)
			switch input := rawInput.(type) {
			case string:
				json.Unmarshal([]byte(input), data)
			case *fiber.Ctx:
				form, err := input.MultipartForm()
				if err == nil {
					utils.Log(5, form)
					var formData = map[string]any{}
					for k, v := range form.Value {
						formData[k] = v[0]
					}
					for k, v := range form.File {
						formData[k] = v[0]
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
					var userId, userType = app.Managers.SecurityManager().AuthWithToken(token)
					if userId != "" {
						var user models.User
						app.Managers.DatabaseManager().Db.First(&user, userId)
						if check.Space {
							var location = app.Managers.SecurityManager().HandleLocationWithProcessed(token, userId, userType, (*data).GetSpaceId(), (*data).GetTopicId(), (*data).GetMemberId())
							if location.SpaceId != "" {
								var member models.Member
								app.Managers.DatabaseManager().Db.Where("user_id=?", userId).Where("space_id=?", location.SpaceId).First(&member)
								result, err := callback(app, (*data), models.Info{User: user, Member: member})
								if err != nil {
									return fiber.ErrInternalServerError.Code, nil, err
								}
								return fiber.StatusOK, result, nil
							} else {
								return fiber.StatusForbidden, nil, errors.New("access denied")
							}
						} else {
							result, err := callback(app, *data, models.Info{User: user})
							if err != nil {
								return fiber.ErrInternalServerError.Code, nil, err
							}
							return fiber.StatusOK, result, nil
						}
					} else {
						return fiber.StatusForbidden, nil, errors.New("access denied")
					}
				} else {
					result, err := callback(app, *data, models.Info{})
					if err != nil {
						return fiber.ErrInternalServerError.Code, nil, err
					}
					return fiber.StatusOK, result, nil
				}
			} else {
				if check.User {
					var userId, _ = app.Managers.SecurityManager().AuthWithToken(token)
					if userId != "" {
						return -2, PreFedPacket{UserId: userId, Body: *data}, nil
					} else {
						return fiber.ErrInternalServerError.Code, nil, errors.New("access denied")
					}
				} else {
					return -2, PreFedPacket{UserId: "", Body: *data}, nil
				}
			}
		},
		ProcessHonestly: func(app *App, data interface{}, m Meta) (int, any, error) {
			var user models.User
			app.Managers.DatabaseManager().Db.First(&user, m.UserId)
			var member models.Member
			app.Managers.DatabaseManager().Db.Where("user_id=?", m.UserId).Where("space_id=?", m.SpaceId).First(&member)
			result, err := callback(app, data.(T), models.Info{User: user, Member: member})
			if err != nil {
				return fiber.ErrInternalServerError.Code, nil, err
			}
			return fiber.StatusOK, result, nil
		},
		ProcessFederative: func(app *App, data interface{}, a models.Info) (int, any, error) {
			result, err := callback(app, data.(T), a)
			if err != nil {
				return fiber.ErrInternalServerError.Code, nil, err
			}
			return fiber.StatusOK, result, nil
		},
	}
}

func CreateServices(a *App) *Services {
	return &Services{
		app:     a,
		Actions: map[string]*Action{},
	}
}
