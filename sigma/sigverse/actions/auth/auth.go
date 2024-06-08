package actions_auth

import (
	"sigma/sigma/abstract"
	tb "sigma/sigma/layer1/module/toolbox"
	modulemodel "sigma/sigma/layer3/model"
	inputsauth "sigma/sigverse/inputs/auth"
	outputsauth "sigma/sigverse/outputs/auth"
)

type AuthActions struct {
	layer abstract.ILayer
}

// GetServerPublicKey /auths/getServerPublicKey check [ false false false ] access [ true false false false GET ]
func (a *AuthActions) GetServerPublicKey(_ abstract.IState, _ inputsauth.GetServerKeyInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.layer.Tools())
	return &outputsauth.GetServerKeyOutput{PublicKey: string(toolbox.Security().FetchKeyPair("server_key")[1])}, nil
}

// GetServersMap /auths/getServersMap check [ false false false ] access [ true false false false GET ]
func (a *AuthActions) GetServersMap(_ abstract.IState, _ inputsauth.GetServersMapInput) (any, error) {
	toolbox := abstract.UseToolbox[*modulemodel.ToolboxL3](a.layer.Core().Get(3).Tools())
	return outputsauth.GetServersMapOutput{Servers: toolbox.Net().Fed.WellKnownServers()}, nil
}
