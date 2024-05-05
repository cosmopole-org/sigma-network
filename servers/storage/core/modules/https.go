package modules

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
)

type HttpServer struct {
	Server *fiber.App
}

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func (h *HttpServer) ListenForHttps(app *App, port int) {
	fmt.Println("Listening to rest port ", port, "...")
	go h.Server.Listen(fmt.Sprintf(":%d", port))
}

func AddEndpoint[T IDto, V any](m *Method[T, V]) {
	Instance().Network.HttpServer.Server.Add(m.MethodOptions.RestAction, m.Key, []fiber.Handler{
		func(c *fiber.Ctx) error {
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
				mapstructure.Decode(formData, body)
			} else {
				if m.MethodOptions.RestAction == "POST" || m.MethodOptions.RestAction == "PUT" || m.MethodOptions.RestAction == "DELETE" {
					c.BodyParser(body)
				} else if m.MethodOptions.RestAction == "GET" {
					c.QueryParser(body)
				}
			}
			originHeader := c.GetReqHeaders()["Origin"]
			var origin = ""
			if originHeader != nil {
				origin = originHeader[0]
			}
			var token = ""
			tokenHeader := c.GetReqHeaders()["Token"]
			if tokenHeader != nil {
				token = tokenHeader[0]
			}
			statusCode, result := ProcessData[T, V](origin, token, *body, m)
			if statusCode == fiber.StatusOK {
				return HandleResutOfFunc(c, result)
			}
			return c.Status(statusCode).JSON(result)
		},
	}...)
}

func LoadHttpServer() *HttpServer {
	return &HttpServer{Server: fiber.New()}
}
