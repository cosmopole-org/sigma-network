package social_services

import (
	"errors"
	"sigma/sigma/abstract"
	module_state "sigma/sigma/layer1/module/state"
	"sigma/sigma/layer2/model"
	"sigma/sigma/utils/crypto"
	inputs_message "sigma/social/inputs/message"
	models "sigma/social/model"
	outputs_message "sigma/social/outputs/message"
	"time"
)

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	state := abstract.UseState[module_state.IStateL1](s)
	return state.Trx().AutoMigrate(&models.Message{})
}

// CreateMessage /messages/create check [ true true true ] access [ true false false false PUT ]
func (a *Actions) CreateMessage(s abstract.IState, input inputs_message.CreateMessageInput) (any, error) {
	state := abstract.UseState[module_state.IStateL1](s)
	trx := state.Trx()
	trx.Use()
	message := models.Message{
		Id:       crypto.SecureUniqueId(a.Layer.Core().Id()),
		AuthorId: state.Info().UserId(),
		SpaceId:  state.Info().SpaceId(),
		TopicId:  state.Info().TopicId(),
		Time:     time.Now().UnixMilli(),
		Data:     models.Json(input.Data),
	}
	err := trx.Create(&message).Error()
	if err != nil {
		return nil, err
	}
	tb := abstract.UseToolbox[*module_model.ToolboxL2](a.Layer.Tools())
	tb.Signaler().SignalGroup("/messages/create", state.Info().SpaceId(), message, true, []string{state.Info().UserId()})
	return outputs_message.CreateMessageOutput{Message: message}, nil
}

// UpdateMessage /messages/update check [ true true true ] access [ true false false false PUT ]
func (a *Actions) UpdateMessage(s abstract.IState, input inputs_message.UpdateMessageInput) (any, error) {
	state := abstract.UseState[module_state.IStateL1](s)
	trx := state.Trx()
	trx.Use()
	message := models.Message{
		Id: input.MessageId,
	}
	err := trx.First(&message).Error()
	if err != nil {
		return nil, err
	}
	if message.AuthorId != state.Info().UserId() {
		return nil, errors.New("access to message denied")
	}
	message.Data = models.Json(input.Data)
	err2 := trx.Save(&message).Error()
	if err2 != nil {
		return nil, err2
	}
	tb := abstract.UseToolbox[*module_model.ToolboxL2](a.Layer.Tools())
	tb.Signaler().SignalGroup("/messages/update", state.Info().SpaceId(), message, true, []string{state.Info().UserId()})
	return outputs_message.UpdateMessageOutput{}, nil
}

// DeleteMessage /messages/delete check [ true true true ] access [ true false false false PUT ]
func (a *Actions) DeleteMessage(s abstract.IState, input inputs_message.DeleteMessageInput) (any, error) {
	state := abstract.UseState[module_state.IStateL1](s)
	trx := state.Trx()
	trx.Use()
	message := models.Message{
		Id: input.MessageId,
	}
	err1 := trx.First(&message).Error()
	if err1 != nil {
		return nil, err1
	}
	if message.AuthorId != state.Info().UserId() {
		return nil, errors.New("access to message denied")
	}
	err2 := trx.Delete(&message).Error()
	if err2 != nil {
		return nil, err2
	}
	tb := abstract.UseToolbox[*module_model.ToolboxL2](a.Layer.Tools())
	tb.Signaler().SignalGroup("/messages/delete", state.Info().SpaceId(), message, true, []string{state.Info().UserId()})
	return outputs_message.UpdateMessageOutput{}, nil
}

// ReadMessages /messages/read check [ true true true ] access [ true false false false PUT ]
func (a *Actions) ReadMessages(s abstract.IState, input inputs_message.ReadMessagesInput) (any, error) {
	state := abstract.UseState[module_state.IStateL1](s)
	messages := []models.Message{}
	state.Trx().Where("topic_id = ?", state.Info().TopicId()).Offset(*input.Offset).Limit(*input.Count).Find(&messages)
	return outputs_message.ReadMessagesOutput{Messages: messages}, nil
}
