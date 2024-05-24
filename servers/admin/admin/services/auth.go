package services

import (
	"context"
	"errors"
	"log"
	"sigma/admin/shell/managers"

	dtos_auth "sigma/admin/admin/dtos/auth"

	"sigma/admin/core/models"
	pb "sigma/admin/core/models/grpc"
	"sigma/admin/core/runtime"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

type AuthService struct {
	managers *managers.Managers
}

func (authS *AuthService) signin(app *runtime.App, input dtos_auth.SigninDto, assistant models.Assistant) (any, error) {
	var query = `select * from humans_signin($1, $2)`
	var token string
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.Email, input.Password,
	).Scan(&token); err != nil {
		log.Println(err)
		return &pb.AdminSigninOutput{}, err
	}
	return &pb.AdminSigninOutput{Token: token}, nil
}

func (authS *AuthService) updatePass(app *runtime.App, input dtos_auth.UpdatePassDto, assistant models.Assistant) (any, error) {
	if len(input.Password) == 0 {
		return &pb.AdminUpdatePassOutput{}, errors.New("error: invalid password")
	}
	var query = `update admin set password = $1 where human_id = $2 returning true;`
	var result bool
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.Password, assistant.UserId,
	).Scan(&result); err != nil {
		log.Println(err)
		return &pb.AdminUpdatePassOutput{}, err
	}
	return &pb.AdminUpdatePassOutput{}, nil
}

func CreateAuthService(sc *runtime.App, mans *managers.Managers) {

	authS := &AuthService{
		managers: mans,
	}

	// tables
	sc.Managers.DatabaseManager().ExecuteSqlFile("admin/database/tables/admin.sql")

	// Functions
	sc.Managers.DatabaseManager().ExecuteSqlFile("admin/database/functions/admins/signin.sql")

	// Methods

	signInAction := runtime.CreateAction(
		sc,
		"/auths/signin",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(true, true, false, false, fiber.MethodPost),
		true,
		authS.signin,
	)
	sc.Services.AddAction(signInAction)
	authS.managers.NetManager().SwitchNetAccessByAction(signInAction, func(i interface{}) (any, error) { return nil, nil })

	updatePassAction := runtime.CreateAction(
		sc,
		"/auths/updatePass",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(true, true, false, false, fiber.MethodPost),
		true,
		authS.updatePass,
	)
	sc.Services.AddAction(updatePassAction)
	authS.managers.NetManager().SwitchNetAccessByAction(updatePassAction, func(i interface{}) (any, error) { return nil, nil })
}

func LoadAuthGrpcService(gs *grpc.Server) {
	type server struct {
		pb.UnimplementedAdminServiceServer
	}
	pb.RegisterAdminServiceServer(gs, &server{})
}
