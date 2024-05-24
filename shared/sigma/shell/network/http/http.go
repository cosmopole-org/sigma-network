package shell_http

import (
	"encoding/json"
	"fmt"
	"log"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	"sigma/main/core/outputs"
	"sigma/main/shell/store/core"

	"github.com/gofiber/fiber/v2"
)

type HttpServer struct {
	Server    *fiber.App
	SendToFed func(string, modules.OriginPacket)
}

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func (hs *HttpServer) Listen(port int) {
	log.Println("Listening to rest port ", port, "...")
	go hs.Server.Listen(fmt.Sprintf(":%d", port))
}

func (hs *HttpServer) Enablendpoint(key string) {
	hs.Server.Add(core.Core().Services.GetAction(key).Access.ActionType, key, []fiber.Handler{
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
			org := core.Core().AppId
			if origin != "" {
				org = origin
			}
			statusCode, result, err := core.Core().Services.CallAction(key, c, token, origin)
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
	}...)
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

func New(maxReqSize int, sendToFed func(string, modules.OriginPacket)) *HttpServer {
	if maxReqSize > 0 {
		return &HttpServer{Server: fiber.New(fiber.Config{BodyLimit: maxReqSize}), SendToFed: sendToFed}
	} else {
		return &HttpServer{Server: fiber.New(), SendToFed: sendToFed}
	}
}
