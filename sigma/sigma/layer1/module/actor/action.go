package module_actor_model

import (
	"encoding/json"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	modulemodel "sigma/sigma/layer1/model"
	toolbox2 "sigma/sigma/layer1/module/toolbox"
)

type Parse func(interface{}) (abstract.IInput, error)

type SecureAction struct {
	abstract.IAction
	core    abstract.ICore
	Guard   *Guard
	logger  *modulelogger.Logger
	Parsers map[string]Parse
}

func NewSecureAction(action abstract.IAction, guard *Guard, core abstract.ICore, logger *modulelogger.Logger, parsers map[string]Parse) *SecureAction {
	return &SecureAction{action, core, guard, logger, parsers}
}

func (a *SecureAction) ParseInput(protocol string, raw interface{}) (abstract.IInput, error) {
	return a.Parsers[protocol](raw)
}

func (a *SecureAction) SecurelyAct(layer abstract.ILayer, token string, origin string, packetId string, input abstract.IInput) (int, any, error) {
	if a.core.Id() == origin {
		success, info := a.Guard.ValidateByToken(token, input.GetSpaceId(), input.GetTopicId())
		if !success {
			return -1, nil, nil
		}
		s := layer.Sb().NewState(info)
		return a.Act(s, input)
	}
	success, userId := a.Guard.ValidateOnlyToken(token)
	if !success {
		return -1, nil, nil
	}
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.core.Get(1).Tools())
	data, err := json.Marshal(input)
	if err != nil {
		a.logger.Println(err)
	}
	toolbox.Federation().SendInFederation(origin, modulemodel.OriginPacket{IsResponse: false, Key: a.Key(), UserId: userId, SpaceId: input.GetSpaceId(), TopicId: input.GetTopicId(), Data: string(data), RequestId: packetId})
	return 1, modulemodel.ResponseSimpleMessage{Message: "request sent to federation"}, nil
}
