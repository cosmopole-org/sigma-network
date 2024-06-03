package services_auth

import (
	inputs_auth "sigma/storage/core/inputs/auth"
	"sigma/storage/core/models"
	outputs_auth "sigma/storage/core/outputs/auth"
	"sigma/storage/core/runtime"
	network_store "sigma/storage/shell/network"
)

func Run(app *runtime.App) {
	app.Services().AddAction(runtime.ExtractFunction(app, GetServerPublicKey))
	app.Services().AddAction(runtime.ExtractFunction(app, GetServersMap))
}

// GetServerPublicKey /auths/getServerPublicKey check [ false false false ] access [ true false false false GET ]
func GetServerPublicKey(control *runtime.Control, input inputs_auth.GetServerKeyInput, info models.Info) (any, error) {
	return &outputs_auth.GetServerKeyOutput{PublicKey: string(control.Security().FetchKeyPair("server_key")[1])}, nil
}

// GetServersMap /auths/getServersMap check [ false false false ] access [ true false false false GET ]
func GetServersMap(control *runtime.Control, input inputs_auth.GetServersMapInput, info models.Info) (any, error) {
	return outputs_auth.GetServersMapOutput{Servers: network_store.WellKnownServers}, nil
}
