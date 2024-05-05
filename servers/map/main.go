package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	pb "sigma/map/grpc"
)

type ServersOutput struct {
	Map map[string]pb.Server `json:"map"`
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
				Map: map[string]pb.Server{
					"8081": {
						Host: "localhost",
						Port: 8081,
					},
					"8082": {
						Host: "localhost",
						Port: 8082,
					},
				},
			})
	})
	app.Listen(fmt.Sprintf(":%d", 8086))
}
