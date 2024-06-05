package net_http

import (
	"fmt"
	"github.com/mitchellh/mapstructure"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	modulemodel "sigma/sigma/layer1/model"
	moduleactormodel "sigma/sigma/layer1/module/actor"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type HttpServer struct {
	sigmaCore abstract.ICore
	shadows   map[string]bool
	Server    *fiber.App
	logger    *modulelogger.Logger
}

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func ParseInput[T abstract.IInput](c *fiber.Ctx) (T, error) {
	data := new(T)
	form, err := c.MultipartForm()
	if err == nil {
		var formData = map[string]any{}
		for k, v := range form.Value {
			formData[k] = v[0]
		}
		for k, v := range form.File {
			formData[k] = v[0]
		}
		err := mapstructure.Decode(formData, data)
		if err != nil {
			return *data, err
		}
	} else {
		if c.Method() == "POST" || c.Method() == "PUT" || c.Method() == "DELETE" {
			err := c.BodyParser(data)
			if err != nil {
				return *data, err
			}
		} else if c.Method() == "GET" {
			err := c.QueryParser(data)
			if err != nil {
				return *data, err
			}
		}
	}
	return *data, nil
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
	var layerNum = 0
	layerNumHeader := c.GetReqHeaders()["Layer"]
	if layerNumHeader == nil {
		return c.Status(fiber.StatusBadRequest).JSON(modulemodel.BuildErrorJson("layer number not specified"))
	}
	ln, err := strconv.ParseInt(layerNumHeader[0], 10, 32)
	if err != nil {
		hs.logger.Println(err)
		return c.Status(fiber.StatusBadRequest).JSON(modulemodel.BuildErrorJson("layer number not specified"))
	}
	layerNum = int(ln)
	org := hs.sigmaCore.Id()
	if origin != "" {
		org = origin
	}
	layer := hs.sigmaCore.Get(layerNum)
	action := layer.Actor().FetchAction(c.Path())
	if action == nil {
		return c.Status(fiber.StatusNotFound).JSON(modulemodel.BuildErrorJson("action not found"))
	}
	input, err2 := action.(*moduleactormodel.SecureAction).ParseInput("http", c)
	if err2 != nil {
		hs.logger.Println(err2)
		return c.Status(fiber.StatusBadRequest).JSON(modulemodel.BuildErrorJson("input parsing error"))
	}
	statusCode, result, err := action.(*moduleactormodel.SecureAction).SecurelyAct(layer, token, org, requestId, input)
	if statusCode == 1 {
		return handleResultOfFunc(c, result)
	} else if err != nil {
		return c.Status(statusCode).JSON(modulemodel.BuildErrorJson(err.Error()))
	}
	return c.Status(statusCode).JSON(result)
}

func (hs *HttpServer) Listen(port int) {
	hs.Server.Get("/", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).Send([]byte("hello world"))
	})
	hs.Server.Use(func(c *fiber.Ctx) error {
		return hs.handleRequest(c)
	})
	hs.logger.Println("Listening to rest port ", port, "...")
	go func() {
		err := hs.Server.Listen(fmt.Sprintf(":%d", port))
		if err != nil {
			hs.logger.Println(err)
		}
	}()
}

func handleResultOfFunc(c *fiber.Ctx, result any) error {
	switch result := result.(type) {
	case modulemodel.Command:
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

func New(core abstract.ICore, logger *modulelogger.Logger, maxReqSize int) *HttpServer {
	if maxReqSize > 0 {
		return &HttpServer{sigmaCore: core, logger: logger, shadows: map[string]bool{}, Server: fiber.New(fiber.Config{BodyLimit: maxReqSize})}
	} else {
		return &HttpServer{sigmaCore: core, logger: logger, shadows: map[string]bool{}, Server: fiber.New()}
	}
}
