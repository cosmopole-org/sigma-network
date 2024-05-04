package modules

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type HttpServer struct {
	Server *fiber.App
}

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func (h *HttpServer) ListenForHttps(app *App, port int) {
	fmt.Println("Listening to rest port ", port, "...")
	go h.Server.Listen(fmt.Sprintf(":%d", port))
}

func LoadHttpServer() *HttpServer {
	hs := &HttpServer{}
	hs.Server = fiber.New()
	return hs
}
