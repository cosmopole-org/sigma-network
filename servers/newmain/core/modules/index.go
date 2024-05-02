package modules

import (
	"sigma/main/core/utils"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type IPacket interface {
	GetData() any
}

type ListenOptions struct {
	Https     bool
	HttpsPort int
	Grpc      bool
	GrpcPort  int
}

type Meta struct {
	UserId  int64
	TowerId int64
	RoomId  int64
}

type IDto interface {
	GetData() any
}

type IError struct {
	Field string
	Tag   string
	Value string
}

func ValidateInput[T any](c *fiber.Ctx, actionType string) error {
	var errors []*IError
	body := new(T)
	if actionType == "POST" {
		c.BodyParser(body)
	} else if actionType == "GET" {
		c.QueryParser(body)
	}
	err := utils.Validate.Struct(body)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			var el IError
			el.Field = err.Field()
			el.Tag = err.Tag()
			el.Value = err.Param()
			errors = append(errors, &el)
		}
		return c.Status(fiber.StatusBadRequest).JSON(errors)
	}
	return c.Next()
}

func ProcessData[T any](c *fiber.Ctx, actionType string, assistant Assistant, fn func(app *App, dto *T, a Assistant) (any, error)) error {
	body := new(T)
	if actionType == "POST" {
		c.BodyParser(body)
	} else if actionType == "GET" {
		c.QueryParser(body)
	}
	result, err := fn(Instance(), body, assistant)
	if err != nil {
		c.Status(fiber.ErrInternalServerError.Code).JSON(err)
		return err
	}
	c.Status(fiber.StatusOK).JSON(result)
	return nil
}
