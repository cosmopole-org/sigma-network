package actions_user

import (
	"fmt"
	inputs_users "sigma/main/core/inputs/users"
	"sigma/main/core/models"
	outputs_users "sigma/main/core/outputs/users"
	"sigma/main/core/runtime"
	"sigma/main/core/utils"
)

type UserActions struct {
	App *runtime.App
}

// Authenticate /users/authenticate check [ true false false ] access [ true false false false POST ]
func (a *UserActions) Authenticate(state sigmastate.ISigmaStatePool, input inputs_users.AuthenticateInput, info models.Info) (any, error) {
	_, res, _ := context.Services().CallActionInternally("/users/get", context, inputs_users.GetInput{UserId: info.User.Id}, runtime.Meta{UserId: "", SpaceId: "", TopicId: ""})
	return outputs_users.AuthenticateOutput{Authenticated: true, User: res.(outputs_users.GetOutput).User}, nil
}

// Create /users/create check [ false false false ] access [ true false false false POST ]
func (a *UserActions) Create(state sigmastate.ISigmaStatePool, input inputs_users.CreateInput, info models.Info) (any, error) {
	token := utils.SecureUniqueString()
	user := models.User{Id: utils.SecureUniqueId(context.AppId), Type: "human", Username: input.Username + "@" + context.AppId, Secret: input.Secret, Name: input.Name, Avatar: input.Avatar}
	context.Trx.Create(&user)
	session := models.Session{Id: utils.SecureUniqueId(context.AppId), Token: token, UserId: user.Id}
	context.Trx.Create(&session)
	context.Adapters().Cache().Put("auth::"+session.Token, fmt.Sprintf("human/%s", user.Id))
	return outputs_users.CreateOutput{User: user, Session: session}, nil
}

// Update /users/update check [ true false false ] access [ true false false false PUT ]
func (a *UserActions) Update(state sigmastate.ISigmaStatePool, input inputs_users.UpdateInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	context.Trx.First(&user)
	user.Name = input.Name
	user.Avatar = input.Avatar
	user.Username = input.Username + "@" + context.AppId
	context.Trx.Save(&user)
	return outputs_users.UpdateOutput{
		User: models.PublicUser{Id: user.Id, Type: user.Type, Username: user.Username, Name: user.Name, Avatar: user.Avatar},
	}, nil
}

// Get /users/get check [ false false false ] access [ true false false false GET ]
func (a *UserActions) Get(state sigmastate.ISigmaStatePool, input inputs_users.GetInput, info models.Info) (any, error) {
	user := models.User{Id: input.UserId}
	err := context.Trx.First(&user).Error()
	return outputs_users.GetOutput{User: user}, err
}

// Delete /users/delete check [ true false false ] access [ true false false false DELETE ]
func (a *UserActions) Delete(state sigmastate.ISigmaStatePool, input inputs_users.DeleteInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	err := context.Trx.First(&user).Error()
	if err != nil {
		return nil, err
	}
	sessions := []models.Session{}
	context.Trx.Where("user_id = ?", user.Id).Find(&sessions)
	for _, session := range sessions {
		context.Adapters().Cache().Del("auth::" + session.Token)
		context.Trx.Delete(&session)
	}
	context.Trx.Delete(&user)
	return outputs_users.DeleteOutput{User: user}, nil
}
