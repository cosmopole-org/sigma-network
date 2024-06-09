package actions_auth

import (
	inputs_auth "sigma/main/layer1/inputs/auth"
	"sigma/main/layer1/models"
	outputs_auth "sigma/main/layer1/outputs/auth"
	core "sigma/main/layer1/runtime"
	network_store "sigma/main/shell/network"
)

type AuthActions struct {
	layer *core.Layer1Context
}

// GetServerPublicKey /auths/getServerPublicKey check [ false false false ] access [ true false false false GET ]
func (a *AuthActions) GetServerPublicKey(state models.ISigmaStatePool, input inputs_auth.GetServerKeyInput, info models.Info) (any, error) {
	return &outputs_auth.GetServerKeyOutput{PublicKey: string(Security().FetchKeyPair("server_key")[1])}, nil
}

// GetServersMap /auths/getServersMap check [ false false false ] access [ true false false false GET ]
func (a *AuthActions) GetServersMap(state models.ISigmaStatePool, input inputs_auth.GetServersMapInput, info models.Info) (any, error) {
	return outputs_auth.GetServersMapOutput{Servers: network_store.WellKnownServers}, nil
}
