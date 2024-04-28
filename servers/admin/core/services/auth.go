package services

import (
	"context"
	"errors"
	"fmt"
	"sigma/main/core/interfaces"
	"sigma/main/core/types"
	"sigma/main/core/utils"

	pb "sigma/main/core/grpc"
)

func signin(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.AdminSigninDto)
	var query = `select * from humans_signin($1, $2)`
	var token string
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Email, input.Password,
	).Scan(&token); err != nil {
		fmt.Println(err)
		return &pb.AdminSigninOutput{}, err
	}
	return &pb.AdminSigninOutput{Token: token}, nil
}

func updatePass(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.AdminUpdatePassDto)
	if len(input.Password) == 0 {
		return &pb.AdminUpdatePassOutput{}, errors.New("error: invalid password")
	}
	var query = `update admin set password = $1 where human_id = $2 returning true;`
	var result bool
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Password, assistant.GetUserId(),
	).Scan(&result); err != nil {
		fmt.Println(err)
		return &pb.AdminUpdatePassOutput{}, err
	}
	return &pb.AdminUpdatePassOutput{}, nil
}

func CreateAuthService(app interfaces.IApp) interfaces.IService {

	// tables
	utils.ExecuteSqlFile("core/database/tables/admin.sql")

	// Functipns
	utils.ExecuteSqlFile("core/database/functions/admins/signin.sql")

	var s = types.CreateService(app, "auth")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedHumanServiceServer
		}
		pb.RegisterHumanServiceServer(app.GetNetwork().GetGrpcServer(), &server{})
	})
	s.AddMethod(types.CreateMethod("updatePass", updatePass, types.CreateCheck(true, false, false), pb.AdminUpdatePassDto{}, types.CreateMethodOptions(true, true)))
	s.AddMethod(types.CreateMethod("signin", signin, types.CreateCheck(false, false, false), pb.AdminSigninDto{}, types.CreateMethodOptions(true, true)))
	return s
}
