package services_auth

import (
	inputs_auth "sigma/storage/core/inputs/auth"
	"sigma/storage/core/models"
	outputs_auth "sigma/storage/core/outputs/auth"
	"sigma/storage/core/runtime"
	network_store "sigma/storage/shell/network"

	"github.com/gofiber/fiber/v2"
)

type AuthService struct {
	app *runtime.App	
}

func (s *AuthService) getServerPublicKey(control *runtime.Control, input inputs_auth.GetServerKeyInput, info models.Info) (any, error) {
	return &outputs_auth.GetServerKeyOutput{PublicKey: string(s.app.Security().FetchKeyPair("server_key")[1])}, nil
}

func (s *AuthService) getServersMap(control *runtime.Control, input inputs_auth.GetServersMapInput, info models.Info) (any, error) {
	return outputs_auth.GetServersMapOutput{
		Servers: network_store.WellKnownServers,
	}, nil
}

func CreateAuthService(app *runtime.App) {

	service := &AuthService{app: app}

	app.Services().AddAction(runtime.CreateAction(
		app,
		"/auths/getServerPublicKey",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(app.OpenToNet, true, false, false, fiber.MethodGet),
		true,
		service.getServerPublicKey,
	))
	app.Services().AddAction(runtime.CreateAction(
		app,
		"/auths/getServersMap",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(app.OpenToNet, true, false, false, fiber.MethodGet),
		true,
		service.getServersMap,
	))
}
