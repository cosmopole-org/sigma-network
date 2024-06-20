package actions_auth

import (
	"sigma/sigma/abstract"
	tb "sigma/sigma/layer1/module/toolbox"
	modulemodel "sigma/sigma/layer3/model"
	inputsauth "sigma/sigverse/inputs/auth"
	outputsauth "sigma/sigverse/outputs/auth"
)

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState) {}

// GetServerPublicKey /auths/getServerPublicKey check [ false false false ] access [ true false false false GET ]
func (a *Actions) GetServerPublicKey(_ abstract.IState, _ inputsauth.GetServerKeyInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	return &outputsauth.GetServerKeyOutput{PublicKey: string(toolbox.Security().FetchKeyPair("server_key")[1])}, nil
}

// GetServersMap /auths/getServersMap check [ false false false ] access [ true false false false GET ]
func (a *Actions) GetServersMap(_ abstract.IState, _ inputsauth.GetServersMapInput) (any, error) {
	toolbox := abstract.UseToolbox[*modulemodel.ToolboxL3](a.Layer.Core().Get(3).Tools())
	return outputsauth.GetServersMapOutput{Servers: toolbox.Net().Fed.WellKnownServers()}, nil
}
