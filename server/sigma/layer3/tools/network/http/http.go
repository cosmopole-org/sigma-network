package net_http

import (
	"encoding/json"
	"fmt"
	"log"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	modulemodel "sigma/sigma/layer1/model"
	moduleactormodel "sigma/sigma/layer1/module/actor"
	"sigma/sigma/layer2/tools/wasm/model"
	realip "sigma/sigma/utils/ip"
	"strconv"

	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/mitchellh/mapstructure"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
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
		if c.Method() == "GET" {
			err := c.QueryParser(data)
			if err != nil {
				return *data, err
			}
			return *data, nil
		}
		err := c.BodyParser(data)
		if err != nil {
			return *data, err
		}
	}
	return *data, nil
}

func parseGlobally(c *fiber.Ctx) (abstract.IInput, error) {
	if c.Method() == "GET" {
		params, err := json.Marshal(c.AllParams())
		if err != nil {
			return nil, err
		}
		return model.WasmInput{Data: string(params)}, nil
	}
	return model.WasmInput{Data: string(c.BodyRaw())}, nil
}

func (hs *HttpServer) handleRequest(c *fiber.Ctx) error {
	originHeader := c.GetReqHeaders()["Dest"]
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
		layerNum = 1
	} else {
		ln, err := strconv.ParseInt(layerNumHeader[0], 10, 32)
		if err != nil {
			hs.logger.Println(err)
			return c.Status(fiber.StatusBadRequest).JSON(modulemodel.BuildErrorJson("layer number not specified"))
		}
		layerNum = int(ln)
	}
	org := hs.sigmaCore.Id()
	if origin != "" {
		org = origin
	}
	layer := hs.sigmaCore.Get(layerNum)
	action := layer.Actor().FetchAction(c.Path())
	if action == nil {
		return c.Status(fiber.StatusNotFound).JSON(modulemodel.BuildErrorJson("action not found"))
	}
	var input abstract.IInput
	if action.(*moduleactormodel.SecureAction).HasGlobalParser() {
		var err1 error
		input, err1 = parseGlobally(c)
		if err1 != nil {
			hs.logger.Println(err1)
			return c.Status(fiber.StatusBadRequest).JSON(modulemodel.BuildErrorJson(err1.Error()))
		}
	} else {
		i, err2 := action.(*moduleactormodel.SecureAction).ParseInput("http", c)
		if err2 != nil {
			hs.logger.Println(err2)
			return c.Status(fiber.StatusBadRequest).JSON(modulemodel.BuildErrorJson("input parsing error"))
		}
		input = i
	}
	log.Println("input of request : ---------------------")
	log.Println(input)
	log.Println("----------------------------------------")
	statusCode, result, err := action.(*moduleactormodel.SecureAction).SecurelyAct(layer, token, org, requestId, input, realip.FromRequest(c.Context()))
	if statusCode == 1 {
		return handleResultOfFunc(c, result)
	} else if err != nil {
		httpStatusCode := fiber.StatusInternalServerError
		if statusCode == -1 {
			httpStatusCode = fiber.StatusForbidden
		}
		return c.Status(httpStatusCode).JSON(modulemodel.BuildErrorJson(err.Error()))
	}
	return c.Status(statusCode).JSON(result)
}

func (hs *HttpServer) Listen(port int) {
	hs.Server.Use(cors.New(cors.Config{
		AllowOrigins: "*",
	}))
	hs.Server.Get("/", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).Send([]byte("hello world"))
	})
    hs.Server.Use(recover.New())
	hs.Server.Get("/.well-known/acme-challenge/FcSacjLJlVPjUd9KyEeqGGjNPx87s1d5d_IWjGWA1iQ", func(c *fiber.Ctx) error {
		c.Status(fiber.StatusOK).SendString("FcSacjLJlVPjUd9KyEeqGGjNPx87s1d5d_IWjGWA1iQ.STrdEMUitBXXsTS69K9R85ZIe4IQBqIGDBkgJdRB1hk")
		return nil
	})
	hs.Server.Use(func(c *fiber.Ctx) error {
		return hs.handleRequest(c)
	})
	hs.logger.Println("Listening to rest port ", port, "...")
	go func() {
		err := hs.Server.ListenTLS(fmt.Sprintf(":%d", port), "./cert.pem", "./cert.key")
		// err := hs.Server.Listen(fmt.Sprintf(":%d", port))
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
