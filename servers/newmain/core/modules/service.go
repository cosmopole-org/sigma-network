package modules

import (
	"errors"
	
	"github.com/gofiber/fiber/v2"
)

var Methods = map[string]interface{}{}

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
						return ProcessData[V](c, m.MethodOptions.RestAction, CreateAssistant(userId, "human", 0, 0, 0, nil), m.Callback)
					} else {
						err := errors.New("access denied")
						c.Status(fiber.StatusForbidden).JSON(err)
						return err
					}
				} else {
					return ProcessData[V](c, m.MethodOptions.RestAction, CreateAssistant(0, "", 0, 0, 0, nil), m.Callback)
				}
			},
		}...)
	}
}

func GetMethod[T any, V any](key string) *Method[T, V] {
	return Methods[key].(*Method[T, V])
}

func CallMethod[T any, V any](key string, dto *V, meta *Meta) (any, error) {
	var method = GetMethod[T, V](key)
	return method.Callback(Instance(), dto, CreateAssistant(meta.UserId, "human", meta.TowerId, meta.RoomId, 0, nil))
}

type Method[T any, V any] struct {
	Key           string
	Callback      func(*App, *V, Assistant) (any, error)
	Check         *Check
	MethodOptions *MethodOptions
	ServiceKey    string
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

func CreateMethod[T any, V any](key string, callback func(*App, *V, Assistant) (any, error), check *Check, mOptions *MethodOptions) *Method[T, V] {
	return &Method[T, V]{Key: key, Callback: callback, Check: check, MethodOptions: mOptions}
}

func CreateCheck(user bool, tower bool, room bool) *Check {
	return &Check{User: user, Tower: tower, Room: room}
}

func CreateMethodOptions(asEndpoint bool, restAction string, asGrpc bool, inFederation bool) *MethodOptions {
	return &MethodOptions{AsEndpoint: asEndpoint, RestAction: restAction, AsGrpc: asGrpc, InFederation: inFederation}
}
