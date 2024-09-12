package actions_user

import (
	"fmt"
	inputs_users "sigma/admin/core/inputs/users"
	"sigma/admin/core/models"
	outputs_users "sigma/admin/core/outputs/users"
	"sigma/admin/core/runtime"
	"sigma/admin/core/utils"
)

type UserActions struct {
	App *runtime.App
}

// Authenticate /users/authenticate check [ true false false ] access [ true false false false POST ]
func (a *UserActions) Authenticate(control *runtime.Control, input inputs_users.AuthenticateInput, info models.Info) (any, error) {
	_, res, _ := control.Services().CallActionInternally("/users/get", control, inputs_users.GetInput{UserId: info.User.Id}, runtime.Meta{UserId: "", SpaceId: "", TopicId: ""})
	return outputs_users.AuthenticateOutput{Authenticated: true, User: res.(outputs_users.GetOutput).User}, nil
}

// Create /users/create check [ false false false ] access [ true false false false POST ]
func (a *UserActions) Create(control *runtime.Control, input inputs_users.CreateInput, info models.Info) (any, error) {
	token := utils.SecureUniqueString()
	user := models.User{Id: utils.SecureUniqueId(control.AppId), Type: "human", Username: input.Username + "@" + control.AppId, Secret: input.Secret, Name: input.Name, Avatar: input.Avatar}
	control.Trx.Create(&user)
	session := models.Session{Id: utils.SecureUniqueId(control.AppId), Token: token, UserId: user.Id}
	control.Trx.Create(&session)
	control.Adapters().Cache().Put("auth::"+session.Token, fmt.Sprintf("human/%s", user.Id))
	return outputs_users.CreateOutput{User: user, Session: session}, nil
}

// Update /users/update check [ true false false ] access [ true false false false PUT ]
func (a *UserActions) Update(control *runtime.Control, input inputs_users.UpdateInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	control.Trx.First(&user)
	user.Name = input.Name
	user.Avatar = input.Avatar
	user.Username = input.Username + "@" + control.AppId
	control.Trx.Save(&user)
	return outputs_users.UpdateOutput{
		User: models.PublicUser{Id: user.Id, Type: user.Type, Username: user.Username, Name: user.Name, Avatar: user.Avatar},
	}, nil
}

// Get /users/get check [ false false false ] access [ true false false false GET ]
func (a *UserActions) Get(control *runtime.Control, input inputs_users.GetInput, info models.Info) (any, error) {
	user := models.User{Id: input.UserId}
	err := control.Trx.First(&user).Error()
	return outputs_users.GetOutput{User: user}, err
}

// Delete /users/delete check [ true false false ] access [ true false false false DELETE ]
func (a *UserActions) Delete(control *runtime.Control, input inputs_users.DeleteInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	err := control.Trx.First(&user).Error()
	if err != nil {
		return nil, err
	}
	sessions := []models.Session{}
	control.Trx.Where("user_id = ?", user.Id).Find(&sessions)
	for _, session := range sessions {
		control.Adapters().Cache().Del("auth::" + session.Token)
		control.Trx.Delete(&session)
	}
	control.Trx.Delete(&user)
	return outputs_users.DeleteOutput{User: user}, nil
}
