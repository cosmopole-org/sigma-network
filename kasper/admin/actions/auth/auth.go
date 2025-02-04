package actions_auth

import (
	"errors"
	admin_inputs_auth "sigma/admin/inputs/auth"
	admin_outputs_auth "sigma/admin/outputs/auth"
	"sigma/sigma/abstract"
	states "sigma/sigma/layer1/module/state"
	"sigma/sigverse/model"
)

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	return nil
}

// Login /admin/auth/login check [ false false false ] access [ true false false false POST ]
func (a *Actions) Login(s abstract.IState, input admin_inputs_auth.AdminInput) (any, error) {
	state := abstract.UseState[states.IStateL1](s)
	user := model.User{}
	trx := state.Trx()
	trx.Use()
	err := trx.Where("username = ?", input.Email).Where("secret = ?", input.Password).First(&user).Error()
	if err != nil {
		return nil, err
	}
	if user.Id == "" {
		return nil, errors.New("access denied")
	}
	trx.Reset()
	session := model.Session{}
	trx.Where("user_id = ?", user.Id).First(&session)
	return admin_outputs_auth.LoginOutput{Token: session.Token}, nil
}

// ChangePass /admin/auth/changePass check [ true false false ] access [ true false false false POST ]
func (a *Actions) ChangePass(s abstract.IState, input admin_inputs_auth.ChangePassInput) (any, error) {
	state := abstract.UseState[states.IStateL1](s)
	if !state.Info().IsGod() {
		return nil, errors.New("access denied")
	}
	if len(input.Password) == 0 {
		return nil, errors.New("error: invalid password")
	}
	trx := state.Trx()
	trx.Use()
	user := model.User{Id: state.Info().UserId()}
	err := trx.First(&user).Error()
	if err != nil {
		return err, nil
	}
	user.Secret = input.Password
	trx.Save(&user)
	return admin_outputs_auth.ChangePassOutput{}, nil
}
