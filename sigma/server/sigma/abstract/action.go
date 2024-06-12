package abstract

type IActions interface {
	Install(IState)
}

type IAction interface {
	Key() string
	Act(IState, IInput) (int, any, error)
}

type ISecureAction interface {
	Key() string
	SecurelyAct(layer ILayer, token string, origin string, packetId string, input IInput) (int, any, error)
	SecurelyActFed(layer ILayer, userId string, input IInput) (int, any, error)
}
