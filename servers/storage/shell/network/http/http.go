package shell_http

import (
	"encoding/json"
	"fmt"
	"sigma/storage/core/dtos"
	"sigma/storage/core/models"
	"sigma/storage/core/outputs"
	"sigma/storage/core/runtime"
	"sigma/storage/core/utils"

	"github.com/gofiber/fiber/v2"
)

type HttpServer struct {
	app *runtime.App
	Server    *fiber.App
	SendToFed func(string, models.OriginPacket)
}

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func (hs *HttpServer) AddMiddleware(mw func(*fiber.Ctx) error) {
	hs.Server.Use(mw)
}

func (hs *HttpServer) Listen(port int) {
	utils.Log(5, "Listening to rest port ", port, "...")
	go hs.Server.Listen(fmt.Sprintf(":%d", port))
}

func (hs *HttpServer) Enablendpoint(key string) {
	layers := []fiber.Handler{}
	layers = append(layers,
		func(c *fiber.Ctx) error {
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
			org := hs.app.AppId
			if origin != "" {
				org = origin
			}
			statusCode, result, err := hs.app.Services.CallAction(key, c, token, origin)
			if statusCode == fiber.StatusOK {
				return HandleResutOfFunc(c, result)
			} else if statusCode == -2 {
				data, err := json.Marshal(result.(runtime.PreFedPacket).Body)
				if err != nil {
					utils.Log(5, err)
					return c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err.Error()))
				}
				hs.SendToFed(org, models.OriginPacket{IsResponse: false, Key: key, UserId: result.(int64), TowerId: result.(runtime.PreFedPacket).Body.(dtos.IDto).GetTowerId(), RoomId: result.(runtime.PreFedPacket).Body.(dtos.IDto).GetRoomId(), Data: string(data), RequestId: requestId})
				return c.Status(fiber.StatusOK).JSON(models.ResponseSimpleMessage{Message: "request to federation queued successfully"})
			} else if err != nil {
				return c.Status(statusCode).JSON(utils.BuildErrorJson(err.Error()))
			}
			return c.Status(statusCode).JSON(result)
		},
	)
	hs.Server.Add(hs.app.Services.GetAction(key).Access.ActionType, key, layers...)
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

func New(sc *runtime.App, maxReqSize int, sendToFed func(string, models.OriginPacket)) *HttpServer {
	if maxReqSize > 0 {
		return &HttpServer{app: sc, Server: fiber.New(fiber.Config{BodyLimit: maxReqSize}), SendToFed: sendToFed}
	} else {
		return &HttpServer{app: sc, Server: fiber.New(), SendToFed: sendToFed}
	}
}
