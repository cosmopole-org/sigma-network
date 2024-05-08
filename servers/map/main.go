package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

type ServersOutput struct {
	Map map[string]bool `json:"map"`
}

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	app := fiber.New()
	app.Get("map/get", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(
			ServersOutput{
				Map: map[string]bool{
					"localhost->8081": true,
					"localhost->8082": true,
				},
			})
	})
	app.Listen(fmt.Sprintf(":%d", 8086))
}
