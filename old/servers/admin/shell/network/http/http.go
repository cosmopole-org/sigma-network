package shell_http

import (
	"fmt"
	"sigma/admin/core/outputs"
	"sigma/admin/core/runtime"
	"sigma/admin/core/utils"

	"github.com/gofiber/fiber/v2"
)

type HttpServer struct {
	sigmaCore *runtime.App
	shadows   map[string]bool
	Server    *fiber.App
}

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func (hs *HttpServer) handleRequest(c *fiber.Ctx) error {
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
	statusCode, result, err := hs.sigmaCore.Services().CallAction(c.Path(), requestId, c, token, org)
	if statusCode == fiber.StatusOK {
		return HandleResutOfFunc(c, result)
	} else if err != nil {
		return c.Status(statusCode).JSON(utils.BuildErrorJson(err.Error()))
	}
	return c.Status(statusCode).JSON(result)
}

func (hs *HttpServer) Listen(port int) {
	hs.Server.Get("/", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).Send([]byte("hello world"))
	})
	hs.Server.Use(func(c *fiber.Ctx) error {
		if hs.shadows[c.Path()] {
			return hs.handleRequest(c)
		}
		return c.Next()
	})
	utils.Log(5, "Listening to rest port ", port, "...")
	go hs.Server.Listen(fmt.Sprintf(":%d", port))
}

func (hs *HttpServer) Enablendpoint(key string) {
	layers := []fiber.Handler{}
	layers = append(layers, hs.handleRequest)
	hs.Server.Add(hs.sigmaCore.Services().GetAction(key).Access.ActionType, key, layers...)
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

func (hs *HttpServer) AddShadow(key string) {
	hs.shadows[key] = true
}

func New(sc *runtime.App, maxReqSize int) *HttpServer {
	if maxReqSize > 0 {
		return &HttpServer{sigmaCore: sc, shadows: map[string]bool{}, Server: fiber.New(fiber.Config{BodyLimit: maxReqSize})}
	} else {
		return &HttpServer{sigmaCore: sc, shadows: map[string]bool{}, Server: fiber.New()}
	}
}
