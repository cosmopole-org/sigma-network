package shell_http

import (
	"encoding/json"
	"fmt"
	"log"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	"sigma/main/shell/outputs"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
)

type HttpServer struct {
	Server    *fiber.App
	SendToFed func(*modules.App, string, modules.OriginPacket)
}

var instance *HttpServer

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func Listen(port int) {
	log.Println("Listening to rest port ", port, "...")
	go instance.Server.Listen(fmt.Sprintf(":%d", port))
}

func AddEndpoint[T  modules.IDto, V any](m *modules.Method[T, V]) {
	handlers := []fiber.Handler{}
	if m.HttpValidation {
		handlers = append(handlers, func(c *fiber.Ctx) error {
			body := new(T)
			if m.MethodOptions.Action == "POST" || m.MethodOptions.Action == "PUT" || m.MethodOptions.Action == "DELETE" {
				c.BodyParser(body)
			} else if m.MethodOptions.Action == "GET" {
				c.QueryParser(body)
			}
			errors := modules.ValidateInput[T](*body)
			if len(errors) > 0 {
				return c.Status(fiber.ErrBadRequest.Code).JSON(errors)
			}
			return c.Next()
		})
	}
	handlers = append(handlers, func(c *fiber.Ctx) error {
		body := new(T)
		form, err := c.MultipartForm()
		if err == nil {
			var formData = map[string]any{}
			for k, v := range form.Value {
				formData[k] = v[0]
			}
			for k, v := range form.File {
				formData[k] = v[0]
			}
			mapstructure.Decode(formData, body)
		} else {
			if m.MethodOptions.Action == "POST" || m.MethodOptions.Action == "PUT" || m.MethodOptions.Action == "DELETE" {
				c.BodyParser(body)
			} else if m.MethodOptions.Action == "GET" {
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
		var requestId = ""
		requestIdHeader := c.GetReqHeaders()["RequestId"]
		if requestIdHeader != nil {
			requestId = requestIdHeader[0]
		}
		org := modules.Instance().AppId
		if origin != "" {
			org = origin
		}
		statusCode, result := modules.ProcessData[T, V](origin, token, *body, requestId, m, c)
		if statusCode == fiber.StatusOK {
			return HandleResutOfFunc(c, result)
		} else if statusCode == -2 {
			data, err := json.Marshal(body)
			if err != nil {
				log.Println(err)
				return c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err.Error()))
			}
			instance.SendToFed(modules.Instance(), org, modules.OriginPacket{IsResponse: false, Key: m.Key, UserId: result.(int64), TowerId: (*body).GetTowerId(), RoomId: (*body).GetRoomId(), Data: string(data), RequestId: requestId})
			return c.Status(fiber.StatusOK).JSON(modules.ResponseSimpleMessage{Message: "request to federation queued successfully"})
		}
		return c.Status(statusCode).JSON(result)
	})
	instance.Server.Add(m.MethodOptions.Action, m.Key, handlers...)
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

func New(sendToFed func(*modules.App, string, modules.OriginPacket)) *HttpServer {
	instance = &HttpServer{Server: fiber.New(), SendToFed: sendToFed}
	return instance
}
