package actions_user

import (
	"fmt"
	"sigma/sigma/abstract"
	moduleactormodel "sigma/sigma/core/module/actor/model"
	modulestate "sigma/sigma/layer1/module/state"
	toolbox2 "sigma/sigma/layer1/module/toolbox"
	"sigma/sigma/utils/crypto"
	"sigma/sigverse/inputs"
	inputsusers "sigma/sigverse/inputs/users"
	models "sigma/sigverse/model"
	outputsusers "sigma/sigverse/outputs/users"
)

type UserActions struct {
	Layer abstract.ILayer
}

// Authenticate /users/authenticate check [ true false false ] access [ true false false false POST ]
func (a *UserActions) Authenticate(s abstract.IState, input inputs.HelloInput) (any, error) {
	state := abstract.UseState[*modulestate.StateL1](s)
	_, res, _ := a.Layer.Actor().FetchAction("/users/get").Act(a.Layer.Sb().NewState(moduleactormodel.NewInfo("", "", "")), inputsusers.GetInput{UserId: state.Info().UserId()})
	return outputsusers.AuthenticateOutput{Authenticated: true, User: res.(outputsusers.GetOutput).User}, nil
}

// Create /users/create check [ false false false ] access [ true false false false POST ]
func (a *UserActions) Create(s abstract.IState, input inputsusers.CreateInput) (any, error) {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	token := crypto.SecureUniqueString()
	user := models.User{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), Type: "human", Username: input.Username + "@" + a.Layer.Core().Id(), Secret: input.Secret, Name: input.Name, Avatar: input.Avatar}
	state.Trx().Create(&user)
	session := models.Session{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), Token: token, UserId: user.Id}
	state.Trx().Create(&session)
	toolbox.Cache().Put("auth::"+session.Token, fmt.Sprintf("human/%s", user.Id))
	return outputsusers.CreateOutput{User: user, Session: session}, nil
}

// Update /users/update check [ true false false ] access [ true false false false PUT ]
func (a *UserActions) Update(s abstract.IState, input inputsusers.UpdateInput) (any, error) {
	state := abstract.UseState[*modulestate.StateL1](s)
	user := models.User{Id: state.Info().UserId()}
	state.Trx().Use()
	state.Trx().First(&user)
	user.Name = input.Name
	user.Avatar = input.Avatar
	user.Username = input.Username + "@" + a.Layer.Core().Id()
	state.Trx().Save(&user)
	return outputsusers.UpdateOutput{
		User: models.PublicUser{Id: user.Id, Type: user.Type, Username: user.Username, Name: user.Name, Avatar: user.Avatar},
	}, nil
}

// Get /users/get check [ false false false ] access [ true false false false GET ]
func (a *UserActions) Get(s abstract.IState, input inputsusers.GetInput) (any, error) {
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	user := models.User{Id: input.UserId}
	err := state.Trx().First(&user).Error()
	return outputsusers.GetOutput{User: user}, err
}

// Delete /users/delete check [ true false false ] access [ true false false false DELETE ]
func (a *UserActions) Delete(s abstract.IState, input inputsusers.DeleteInput) (any, error) {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	user := models.User{Id: state.Info().UserId()}
	err := state.Trx().First(&user).Error()
	if err != nil {
		return nil, err
	}
	var sessions []models.Session
	state.Trx().Where("user_id = ?", user.Id).Find(&sessions)
	for _, session := range sessions {
		toolbox.Cache().Del("auth::" + session.Token)
		state.Trx().Delete(&session)
	}
	state.Trx().Delete(&user)
	return outputsusers.DeleteOutput{User: user}, nil
}
