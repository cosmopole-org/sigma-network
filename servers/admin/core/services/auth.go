package services

import (
	"context"
	"errors"
	"fmt"
	"sigma/admin/core/modules"

	pb "sigma/admin/core/grpc"
)

func signin(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	var input = (dto).(*pb.AdminSigninDto)
	var query = `select * from humans_signin($1, $2)`
	var token string
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Email, input.Password,
	).Scan(&token); err != nil {
		fmt.Println(err)
		return &pb.AdminSigninOutput{}, err
	}
	return &pb.AdminSigninOutput{Token: token}, nil
}

func updatePass(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	var input = (dto).(*pb.AdminUpdatePassDto)
	if len(input.Password) == 0 {
		return &pb.AdminUpdatePassOutput{}, errors.New("error: invalid password")
	}
	var query = `update admin set password = $1 where human_id = $2 returning true;`
	var result bool
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Password, assistant.UserId,
	).Scan(&result); err != nil {
		fmt.Println(err)
		return &pb.AdminUpdatePassOutput{}, err
	}
	return &pb.AdminUpdatePassOutput{}, nil
}

func CreateAuthService(app *modules.App) *modules.Service {

	// tables
	app.Database.ExecuteSqlFile("core/database/tables/admin.sql")

	// Functipns
	app.Database.ExecuteSqlFile("core/database/functions/admins/signin.sql")

	var s = modules.CreateService(app, "auth")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedHumanServiceServer
		}
		pb.RegisterHumanServiceServer(app.Network.GrpcServer, &server{})
	})
	s.AddMethod(modules.CreateMethod("updatePass", updatePass, modules.CreateCheck(true, false, false), pb.AdminUpdatePassDto{}, modules.CreateMethodOptions(true, true, false) true)))
	s.AddMethod(modules.CreateMethod("signin", signin, modules.CreateCheck(false, false, false), pb.AdminSigninDto{}, modules.CreateMethodOptions(true, true, false) true)))
	return s
}
