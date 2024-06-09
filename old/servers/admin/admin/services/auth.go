package services

import (
	"errors"
	"sigma/admin/shell/tools"

	inputs_auth "sigma/admin/admin/inputs/auth"
	outputs_auth "sigma/admin/admin/outputs/auth"

	adminModels "sigma/admin/admin/models"
	coreModels "sigma/admin/core/models"
	"sigma/admin/core/runtime"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

type AuthService struct {
	toolbox *tools.Toolbox
}

func (authS *AuthService) signin(control *runtime.Control, input inputs_auth.SigninDto, info coreModels.Info) (any, error) {
	god := adminModels.God{}
	err := control.Trx.Where("username = ?", input.Username).Where("password = ?", input.Password).First(&god).Error()
	if err != nil {
		return nil, err
	}
	session := coreModels.Session{}
	control.Trx.Where("user_id = ?", god.UserId).First(&session)
	return outputs_auth.SigninOutput{Token: session.Token}, nil
}

func (authS *AuthService) updatePass(control *runtime.Control, input inputs_auth.UpdatePassDto, info coreModels.Info) (any, error) {
	if len(input.Password) == 0 {
		return outputs_auth.UpdatePassOutput{}, errors.New("error: invalid password")
	}
	god := adminModels.God{}
	err := control.Trx.Where("user_id = ?", info.User.Id).First(&god).Error()
	if err != nil {
		return nil, err
	}
	god.Password = input.Password
	control.Trx.Save(&god)
	return outputs_auth.UpdatePassOutput{}, nil
}

func CreateAuthService(toolbox *tools.Toolbox) {

	authS := &AuthService{
		toolbox: toolbox,
	}

	signInAction := runtime.CreateAction(
		toolbox.App,
		"/auths/signin",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(true, true, false, false, fiber.MethodPost),
		true,
		authS.signin,
	)
	toolbox.Services().AddAction(signInAction)
	toolbox.Net().SwitchNetAccessByAction(signInAction, func(i interface{}) (any, error) { return nil, nil })

	updatePassAction := runtime.CreateAction(
		toolbox.App,
		"/auths/updatePass",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(true, true, false, false, fiber.MethodPost),
		true,
		authS.updatePass,
	)
	toolbox.Services().AddAction(updatePassAction)
	toolbox.Net().SwitchNetAccessByAction(updatePassAction, func(i interface{}) (any, error) { return nil, nil })
}

func LoadAuthGrpcService(gs *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedAdminServiceServer
	// }
	// pb.RegisterAdminServiceServer(gs, &server{})
}
