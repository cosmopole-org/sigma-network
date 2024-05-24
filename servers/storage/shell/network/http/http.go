package shell_http

import (
	"encoding/json"
	"fmt"
	"log"
	"sigma/storage/core/modules"
	"sigma/storage/core/outputs"
	"sigma/storage/core/utils"

	"github.com/gofiber/fiber/v2"
)

type HttpServer struct {
	sigmaCore   *modules.App
	Server      *fiber.App
	SendToFed   func(string, modules.OriginPacket)
}

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func (hs *HttpServer) AddMiddleware(mw func(*fiber.Ctx) error) {
	hs.Server.Use(mw)
}

func (hs *HttpServer) Listen(port int) {
	log.Println("Listening to rest port ", port, "...")
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
			org := hs.sigmaCore.AppId
			if origin != "" {
				org = origin
			}
			statusCode, result, err := hs.sigmaCore.Services.CallAction(key, c, token, origin)
			if statusCode == fiber.StatusOK {
				return HandleResutOfFunc(c, result)
			} else if statusCode == -2 {
				data, err := json.Marshal(result.(modules.PreFedPacket).Body)
				if err != nil {
					log.Println(err)
					return c.Status(fiber.ErrInternalServerError.Code).JSON(utils.BuildErrorJson(err.Error()))
				}
				hs.SendToFed(org, modules.OriginPacket{IsResponse: false, Key: key, UserId: result.(int64), TowerId: result.(modules.PreFedPacket).Body.(modules.IDto).GetTowerId(), RoomId: result.(modules.PreFedPacket).Body.(modules.IDto).GetRoomId(), Data: string(data), RequestId: requestId})
				return c.Status(fiber.StatusOK).JSON(modules.ResponseSimpleMessage{Message: "request to federation queued successfully"})
			} else if err != nil {
				return c.Status(statusCode).JSON(utils.BuildErrorJson(err.Error()))
			}
			return c.Status(statusCode).JSON(result)
		},
	)
	hs.Server.Add(hs.sigmaCore.Services.GetAction(key).Access.ActionType, key, layers...)
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

func New(sc *modules.App, maxReqSize int, sendToFed func(string, modules.OriginPacket)) *HttpServer {
	if maxReqSize > 0 {
		return &HttpServer{sigmaCore: sc, Server: fiber.New(fiber.Config{BodyLimit: maxReqSize}), SendToFed: sendToFed}
	} else {
		return &HttpServer{sigmaCore: sc, Server: fiber.New(), SendToFed: sendToFed}
	}
}
