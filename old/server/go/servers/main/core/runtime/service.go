package runtime

import (
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"sigma/main/core/adapters/storage"
	"sigma/main/core/inputs"
	"sigma/main/core/models"
	"sigma/main/core/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
)

const accessDeniedError = "access denied"

type Meta struct {
	UserId  string
	SpaceId string
	TopicId string
}

type IError struct {
	Field string
	Tag   string
	Value string
}

type Control struct {
	*App
	Trx storage.ITrx
}

type Action struct {
	Key               string
	Check             Check
	Access            Access
	Validate          bool
	Process           func(*Control, interface{}, string, string) (int, any, error)
	ProcessInternally func(*Control, interface{}, Meta) (int, any, error)
	ProcessFederative func(*Control, interface{}, models.Info) (int, any, error)
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
	app         *App
	Actions     map[string]*Action
	Middlewares []func(key string, packetId string, input interface{}, token string, origin string) (int, any, error)
}

func (ss *Services) PutMiddleware(mw func(key string, packetId string, input interface{}, token string, origin string) (int, any, error)) {
	ss.Middlewares = append(ss.Middlewares, mw)
}

func (ss *Services) PlugService(service interface{}) {
	s := reflect.TypeOf(service)
	for i := 0; i < s.NumMethod(); i++ {
		f := s.Method(i)
		if f.Name == "Install" {
			f.Func.Call([]reflect.Value{reflect.ValueOf(service)})
		} else {
			result := f.Func.Call([]reflect.Value{reflect.ValueOf(service)})
			ss.AddAction(result[0].Interface().(*Action))
		}
	}
}

func ExtractFunction[T inputs.IInput](app *App, service interface{}, actionFunc func(*Control, T, models.Info) (any, error)) *Action {
	key, check, access := extractActionMetadata(service, actionFunc)
	validate := true
	action := &Action{
		Key:      key,
		Check:    check,
		Access:   access,
		Validate: true,
		Process: func(control *Control, rawInput interface{}, token string, origin string) (int, any, error) {
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
			if validate {
				err := ValidateInput(data)
				if err != nil {
					return fiber.ErrBadRequest.Code, nil, err
				}
			}
			if origin == "" {
				origin = app.AppId
			}
			if !access.Fed || (origin == app.AppId) {
				if check.User {
					var userId, userType = app.Security().AuthWithToken(token)
					if userId != "" {
						var user = models.User{Id: userId}
						if check.Space {
							var location = app.Security().HandleLocationWithProcessed(token, userId, userType, (*data).GetSpaceId(), (*data).GetTopicId(), (*data).GetMemberId())
							if location.SpaceId != "" {
								var member = models.Member{SpaceId: location.SpaceId, TopicIds: location.TopicId, Metadata: "", UserId: userId}
								result, err := actionFunc(control, *data, models.Info{User: user, Member: member})
								if err != nil {
									return fiber.ErrInternalServerError.Code, nil, err
								}
								return fiber.StatusOK, result, nil
							} else {
								return fiber.StatusForbidden, nil, errors.New(accessDeniedError)
							}
						} else {
							result, err := actionFunc(control, *data, models.Info{User: user})
							if err != nil {
								return fiber.ErrInternalServerError.Code, nil, err
							}
							return fiber.StatusOK, result, nil
						}
					} else {
						return fiber.StatusForbidden, nil, errors.New(accessDeniedError)
					}
				} else {
					result, err := actionFunc(control, *data, models.Info{})
					if err != nil {
						return fiber.ErrInternalServerError.Code, nil, err
					}
					return fiber.StatusOK, result, nil
				}
			} else {
				if check.User {
					var userId, _ = app.Security().AuthWithToken(token)
					if userId != "" {
						return -2, PreFedPacket{UserId: userId, Body: data}, nil
					} else {
						return fiber.ErrInternalServerError.Code, nil, errors.New(accessDeniedError)
					}
				} else {
					return -2, PreFedPacket{UserId: "", Body: data}, nil
				}
			}
		},
		ProcessInternally: func(control *Control, data interface{}, m Meta) (int, any, error) {
			user := models.User{Id: m.UserId}
			member := models.Member{UserId: user.Id, SpaceId: m.SpaceId, TopicIds: m.TopicId, Metadata: ""}
			result, err := actionFunc(control, data.(T), models.Info{User: user, Member: member})
			fmt.Println()
			fmt.Println(result, err)
			fmt.Println()
			if err != nil {
				return fiber.ErrInternalServerError.Code, nil, err
			}
			return fiber.StatusOK, result, nil
		},
		ProcessFederative: func(control *Control, data interface{}, a models.Info) (int, any, error) {
			result, err := actionFunc(control, data.(T), a)
			if err != nil {
				control.Trx.Rollback()
				return fiber.ErrInternalServerError.Code, nil, err
			}
			control.Trx.Commit()
			return fiber.StatusOK, result, nil
		},
	}
	return action
}

func extractActionMetadata(service interface{}, function interface{}) (string, Check, Access) {
	var ts = strings.Split(utils.FuncDescription(service, function), " ")
	var tokens = []string{}
	for _, token := range ts {
		if len(strings.Trim(token, " ")) > 0 {
			tokens = append(tokens, token)
		}
	}
	var key = tokens[0]
	var check Check
	var access Access
	if tokens[1] == "check" && tokens[2] == "[" && tokens[6] == "]" {
		check = Check{User: tokens[3] == "true", Space: tokens[4] == "true", Topic: tokens[5] == "true"}
		if tokens[7] == "access" && tokens[8] == "[" && tokens[14] == "]" {
			access = Access{Http: tokens[9] == "true", Ws: tokens[10] == "true", Grpc: tokens[11] == "true", Fed: tokens[12] == "true", ActionType: tokens[13]}
		}
	}
	return key, check, access
}

func (ss *Services) CallAction(key string, packetId string, input interface{}, token string, origin string) (int, any, error) {
	for _, mw := range ss.Middlewares {
		statusCode, result, err := mw(key, packetId, input, token, origin)
		if statusCode == -3 {
			continue
		} else {
			return statusCode, result, err
		}
	}
	control := ss.app.GenerateControl()
	statusCode, res, err := ss.Actions[key].Process(control, input, token, origin)
	if statusCode == -2 {
		data, err := json.Marshal(res.(PreFedPacket).Body)
		if err != nil {
			utils.Log(5, err)
		}
		ss.app.Adapters().Federation().SendInFederation(origin, models.OriginPacket{IsResponse: false, Key: key, UserId: res.(PreFedPacket).UserId, SpaceId: res.(PreFedPacket).Body.(inputs.IInput).GetSpaceId(), TopicId: res.(PreFedPacket).Body.(inputs.IInput).GetTopicId(), Data: string(data), RequestId: packetId})
	}
	if err != nil {
		control.Trx.Rollback()
	} else {
		control.Trx.Commit()
	}
	return statusCode, res, err
}

func (ss *Services) CallActionInternally(key string, control *Control, input interface{}, m Meta) (int, any, error) {
	control.Trx.SavePoint("beforeStep")
	statusCode, res, err := ss.Actions[key].ProcessInternally(control, input, m)
	if err != nil {
		control.Trx.RollbackTo("beforeStep")
	}
	return statusCode, res, err
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

func CreateAction[T inputs.IInput](app *App, key string, check Check, access Access, validate bool, callback func(*Control, T, models.Info) (any, error)) *Action {
	return &Action{
		Key:    key,
		Access: access,
		Check:  check,
		Process: func(control *Control, rawInput interface{}, token string, origin string) (int, any, error) {
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
					fmt.Println(formData)
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
			if validate {
				err := ValidateInput(*data)
				if err != nil {
					return fiber.ErrBadRequest.Code, nil, err
				}
			}
			if origin == "" {
				origin = app.AppId
			}
			if !access.Fed || (origin == app.AppId) {
				if check.User {
					var userId, userType = app.Security().AuthWithToken(token)
					if userId != "" {
						var user = models.User{Id: userId}
						if check.Space {
							var location = app.Security().HandleLocationWithProcessed(token, userId, userType, (*data).GetSpaceId(), (*data).GetTopicId(), (*data).GetMemberId())
							if location.SpaceId != "" {
								var member = models.Member{SpaceId: location.SpaceId, TopicIds: location.TopicId, Metadata: "", UserId: userId}
								result, err := callback(control, (*data), models.Info{User: user, Member: member})
								if err != nil {
									return fiber.ErrInternalServerError.Code, nil, err
								}
								return fiber.StatusOK, result, nil
							} else {
								return fiber.StatusForbidden, nil, errors.New(accessDeniedError)
							}
						} else {
							result, err := callback(control, *data, models.Info{User: user})
							if err != nil {
								return fiber.ErrInternalServerError.Code, nil, err
							}
							return fiber.StatusOK, result, nil
						}
					} else {
						return fiber.StatusForbidden, nil, errors.New(accessDeniedError)
					}
				} else {
					result, err := callback(control, *data, models.Info{})
					if err != nil {
						return fiber.ErrInternalServerError.Code, nil, err
					}
					return fiber.StatusOK, result, nil
				}
			} else {
				if check.User {
					var userId, _ = app.Security().AuthWithToken(token)
					if userId != "" {
						return -2, PreFedPacket{UserId: userId, Body: *data}, nil
					} else {
						return fiber.ErrInternalServerError.Code, nil, errors.New(accessDeniedError)
					}
				} else {
					return -2, PreFedPacket{UserId: "", Body: *data}, nil
				}
			}
		},
		ProcessInternally: func(control *Control, data interface{}, m Meta) (int, any, error) {
			user := models.User{Id: m.UserId}
			member := models.Member{UserId: user.Id, SpaceId: m.SpaceId, TopicIds: m.TopicId, Metadata: ""}
			result, err := callback(control, data.(T), models.Info{User: user, Member: member})
			fmt.Println()
			fmt.Println(result, err)
			fmt.Println()
			if err != nil {
				return fiber.ErrInternalServerError.Code, nil, err
			}
			return fiber.StatusOK, result, nil
		},
		ProcessFederative: func(control *Control, data interface{}, a models.Info) (int, any, error) {
			result, err := callback(control, data.(T), a)
			if err != nil {
				control.Trx.Rollback()
				return fiber.ErrInternalServerError.Code, nil, err
			}
			control.Trx.Commit()
			return fiber.StatusOK, result, nil
		},
	}
}

func CreateServices(a *App) *Services {
	ss := &Services{
		app:     a,
		Actions: map[string]*Action{},
	}
	return ss
}
