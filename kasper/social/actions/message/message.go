package social_services

import (
	"errors"
	"sigma/sigma/abstract"
	module_state "sigma/sigma/layer1/module/state"
	"sigma/sigma/layer2/model"
	"sigma/sigma/utils/crypto"
	"sigma/sigverse/model"
	inputs_message "sigma/social/inputs/message"
	models "sigma/social/model"
	outputs_message "sigma/social/outputs/message"
	"time"

	"gorm.io/datatypes"
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

	type author struct {
		Id      string         `json:"id"`
		Profile datatypes.JSON `json:"profile"`
	}
	authorUser := author{}
	state.Trx().Reset()
	state.Trx().Model(&model.User{}).Select("id, metadata -> '"+"hokm"+"' -> 'profile' as profile").Where("id = ?", message.AuthorId).First(&authorUser)
	result := models.ResultMessage{
		Id:       message.Id,
		SpaceId:  message.SpaceId,
		TopicId:  message.TopicId,
		AuthorId: message.AuthorId,
		Data:     message.Data,
		Time:     message.Time,
		Author:   authorUser.Profile,
	}
	tb.Signaler().SignalGroup("/messages/create", state.Info().SpaceId(), result, true, []string{state.Info().UserId()})
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
	return outputs_message.DeleteMessageOutput{}, nil
}

// ReadMessages /messages/read check [ true true true ] access [ true false false false PUT ]
func (a *Actions) ReadMessages(s abstract.IState, input inputs_message.ReadMessagesInput) (any, error) {
	state := abstract.UseState[module_state.IStateL1](s)
	messages := []models.Message{}
	state.Trx().Use()
	state.Trx().Where("topic_id = ?", state.Info().TopicId()).Offset(*input.Offset).Limit(*input.Count).Find(&messages)
	state.Trx().Reset()
	authorIds := []string{}
	for _, msg := range messages {
		authorIds = append(authorIds, msg.AuthorId)
	}
	type author struct {
		Id      string
		Profile datatypes.JSON
	}
	authors := []author{}
	state.Trx().Model(&model.User{}).Select("id as id, metadata -> '"+"hokm"+"' -> 'profile' as profile").Where("id in ?", authorIds).Find(&authors)
	state.Trx().Reset()
	authorDict := map[string]author{}
	for _, a := range authors {
		authorDict[a.Id] = a
	}
	result := []models.ResultMessage{}
	for _, msg := range messages {
		result = append(result, models.ResultMessage{
			Id:       msg.Id,
			SpaceId:  msg.SpaceId,
			TopicId:  msg.TopicId,
			AuthorId: msg.AuthorId,
			Data:     msg.Data,
			Time:     msg.Time,
			Author:   authorDict[msg.AuthorId].Profile,
		})
	}
	return outputs_message.ReadMessagesOutput{Messages: result}, nil
}
