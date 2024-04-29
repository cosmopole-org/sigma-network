package services

import (
	"context"
	"errors"
	"fmt"
	"sigma/admin/core/types"

	pb "sigma/admin/core/grpc"
)

func signin(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
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

func updatePass(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
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

func CreateAuthService(app *types.App) *types.Service {

	// tables
	app.Database.ExecuteSqlFile("core/database/tables/admin.sql")

	// Functipns
	app.Database.ExecuteSqlFile("core/database/functions/admins/signin.sql")

	var s = types.CreateService(app, "auth")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedHumanServiceServer
		}
		pb.RegisterHumanServiceServer(app.Network.GrpcServer, &server{})
	})
	s.AddMethod(types.CreateMethod("updatePass", updatePass, types.CreateCheck(true, false, false), pb.AdminUpdatePassDto{}, types.CreateMethodOptions(true, true)))
	s.AddMethod(types.CreateMethod("signin", signin, types.CreateCheck(false, false, false), pb.AdminSigninDto{}, types.CreateMethodOptions(true, true)))
	return s
}
