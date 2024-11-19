package actions_user

import (
	"errors"
	"fmt"
	"log"
	"sigma/sigma/abstract"
	moduleactormodel "sigma/sigma/core/module/actor/model"
	modulestate "sigma/sigma/layer1/module/state"
	toolbox2 "sigma/sigma/layer1/module/toolbox"
	"sigma/sigma/utils/crypto"
	inputs_spaces "sigma/sigverse/inputs/spaces"
	inputsusers "sigma/sigverse/inputs/users"
	models "sigma/sigverse/model"
	outputsusers "sigma/sigverse/outputs/users"
	"strconv"

	"gorm.io/datatypes"
)

func convertRowIdToCode(rowId uint) string {
	idStr := fmt.Sprintf("%d", rowId)
	for len(idStr) < 6 {
		idStr = "0" + idStr
	}
	var c = ""
	for i := 0; i < len(idStr); i++ {
		if i < 3 {
			digit, err := strconv.ParseInt(idStr[i:i+1], 10, 32)
			if err != nil {
				fmt.Println(err)
				return ""
			}
			c += string(rune('A' + digit))
		} else {
			c += idStr[i : i+1]
		}
	}
	return c
}

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	err := state.Trx().AutoMigrate(&models.User{})
	if err != nil {
		return err
	}
	err2 := state.Trx().AutoMigrate(&models.Session{})
	if err2 != nil {
		return err2
	}
	state.Trx().Use()
	for _, godUsername := range a.Layer.Core().Gods() {
		var user = models.User{}
		userId := ""
		err := state.Trx().Where("username = ?", godUsername + "@" + a.Layer.Core().Id()).First(&user).Error()
		if err != nil {
			log.Println(err)
			state.Trx().Reset()
			_, res, err := a.Layer.Actor().FetchAction("/users/create").Act(a.Layer.Sb().NewState(moduleactormodel.NewInfo("", "", ""), state.Trx(), state.Dummy()),
				inputsusers.CreateInput{
					Username:  godUsername,
					Secret:    crypto.SecureUniqueString(),
					Name:      "",
					Avatar:    "",
					PublicKey: "",
				})
			if err != nil {
				log.Println(err)
				panic(err)
			}
			userId = res.(outputsusers.CreateOutput).User.Id
		} else {
			userId = user.Id
		}
		toolbox.Cache().Put("god::"+userId, "true")
		state.Trx().Reset()
	}
	state.Trx().Reset()
	users := []models.User{}
	state.Trx().Model(&models.User{}).Find(&users)
	go (func ()  {
		for _, user := range users {
			toolbox.Cache().Put("code::"+convertRowIdToCode(uint(user.Number)), user.Id)
		}			
	})()
	state.Trx().Push()
	return nil
}

// Authenticate /users/authenticate check [ true false false ] access [ true false false false POST ]
func (a *Actions) Authenticate(s abstract.IState, _ inputsusers.AuthenticateInput) (any, error) {
	state := abstract.UseState[modulestate.IStateL1](s)
	_, res, _ := a.Layer.Actor().FetchAction("/users/get").Act(a.Layer.Sb().NewState(moduleactormodel.NewInfo("", "", ""), state.Trx()), inputsusers.GetInput{UserId: state.Info().UserId()})
	return outputsusers.AuthenticateOutput{Authenticated: true, User: res.(outputsusers.GetOutput).User}, nil
}

// Create /users/create check [ false false false ] access [ true false false false POST ]
func (a *Actions) Create(s abstract.IState, input inputsusers.CreateInput) (any, error) {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var (
		user    models.User
		session models.Session
	)
	trx := state.Trx()
	trx.Use()
	findErr := trx.Model(&models.User{}).Where("username = ?", input.Username + "@" + a.Layer.Core().Id()).First(&user).Error()
	if findErr == nil {
		if user.Secret == input.Secret {
			trx.Reset()
			trx.Where("user_id = ?", user.Id).First(&session)
			return outputsusers.CreateOutput{User: user, Session: session}, nil

		} else {
			return nil, errors.New("provided secret is incorrent")
		}
	}
	trx.Reset()
	token := crypto.SecureUniqueString()
	user = models.User{Metadata: datatypes.JSON([]byte(`{}`)), Id: crypto.SecureUniqueId(a.Layer.Core().Id()), Typ: "human", PublicKey: input.PublicKey, Username: input.Username + "@" + a.Layer.Core().Id(), Secret: input.Secret, Name: input.Name, Avatar: input.Avatar}
	err := trx.Create(&user).Error()
	if err != nil {
		return nil, err
	}
	code := convertRowIdToCode(uint(user.Number))
	err2 := trx.Model(&models.User{}).Where("id = ?", user.Id).UpdateJson(&user, "metadata", "code", code).Error()
	if err2 != nil {
		return nil, err2
	}
	trx.Reset()
	session = models.Session{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), Token: token, UserId: user.Id}
	err3 := trx.Create(&session).Error()
	if err3 != nil {
		return nil, err3
	}
	trx.Reset()
	_, _, errJoin := a.Layer.Actor().FetchAction("/spaces/join").Act(a.Layer.Sb().NewState(moduleactormodel.NewInfo(user.Id, "", ""), state.Trx()), inputs_spaces.JoinInput{SpaceId: "main@" + a.Layer.Core().Id()})
	if errJoin != nil {
		return nil, err
	}
	toolbox.Cache().Put("auth::"+session.Token, fmt.Sprintf("human/%s", user.Id))
	toolbox.Cache().Put("code::"+code, user.Id)
	return outputsusers.CreateOutput{User: user, Session: session}, state.Trx().Error()
}

// UpdateMeta /player/updateMeta check [ true false false ] access [ true false false false POST ]
func (a *Actions) UpdateMeta(s abstract.IState, input inputsusers.UpdateMetaInput) (any, error) {
	var state = abstract.UseState[modulestate.IStateL1](s)
	trx := state.Trx()
	trx.Use()
	user := models.User{Id: state.Info().UserId()}
	err := trx.First(&user).Error()
	if err != nil {
		return nil, err
	}
	for key, value := range input.Data {
		err2 := trx.Model(&models.User{}).Where("id = ?", state.Info().UserId()).UpdateJson(&user, "metadata", key, value).Error()
		if err2 != nil {
			log.Println(err2)
			trx.Reset()
			continue
		}
	}
	return outputsusers.UpdateMetaOutput{}, nil
}

// Update /users/update check [ true false false ] access [ true false false false PUT ]
func (a *Actions) Update(s abstract.IState, input inputsusers.UpdateInput) (any, error) {
	state := abstract.UseState[modulestate.IStateL1](s)
	var user models.User
	trx := state.Trx()
	trx.Use()
	user = models.User{Id: state.Info().UserId()}
	err := trx.First(&user).Error()
	if err != nil {
		return nil, err
	}
	user.Name = input.Name
	user.Avatar = input.Avatar
	user.Username = input.Username + "@" + a.Layer.Core().Id()
	err2 := trx.Save(&user).Error()
	if err2 != nil {
		return nil, err2
	}
	return outputsusers.UpdateOutput{
		User: models.PublicUser{Id: user.Id, Type: user.Typ, Username: user.Username, Name: user.Name, Avatar: user.Avatar, PublicKey: user.PublicKey},
	}, nil
}

// Get /users/get check [ false false false ] access [ true false false false GET ]
func (a *Actions) Get(s abstract.IState, input inputsusers.GetInput) (any, error) {
	state := abstract.UseState[modulestate.IStateL1](s)
	var user models.User
	trx := state.Trx()
	trx.Use()
	user = models.User{Id: input.UserId}
	err := trx.First(&user).Error()
	if err != nil {
		return nil, err
	}
	return outputsusers.GetOutput{
		User: models.PublicUser{Id: user.Id, Type: user.Typ, Username: user.Username, Name: user.Name, Avatar: user.Avatar, PublicKey: user.PublicKey},
	}, nil
}

// Delete /users/delete check [ true false false ] access [ true false false false DELETE ]
func (a *Actions) Delete(s abstract.IState, _ inputsusers.DeleteInput) (any, error) {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var user models.User
	trx := state.Trx()
	trx.Use()
	user = models.User{Id: state.Info().UserId()}
	err := trx.First(&user).Error()
	if err != nil {
		return nil, err
	}
	var sessions []models.Session
	trx.Where("user_id = ?", user.Id).Find(&sessions)
	for _, session := range sessions {
		toolbox.Cache().Del("auth::" + session.Token)
		err := trx.Delete(&session).Error()
		if err != nil {
			log.Println(err)
		}
	}
	err2 := trx.Delete(&user).Error()
	if err2 != nil {
		return nil, err2
	}
	return outputsusers.DeleteOutput{User: user}, nil
}
