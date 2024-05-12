package services

import (
	"context"
	"errors"
	"log"
	"sigma/admin/core/modules"

	dtos_auths "sigma/admin/shell/dtos/auths"

	pb "sigma/admin/shell/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func signin(app *modules.App, input dtos_auths.SigninDto, assistant modules.Assistant) (any, error) {
	var query = `select * from humans_signin($1, $2)`
	var token string
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Email, input.Password,
	).Scan(&token); err != nil {
		log.Println(err)
		return &pb.AdminSigninOutput{}, err
	}
	return &pb.AdminSigninOutput{Token: token}, nil
}

func updatePass(app *modules.App, input dtos_auths.UpdatePassDto, assistant modules.Assistant) (any, error) {
	if len(input.Password) == 0 {
		return &pb.AdminUpdatePassOutput{}, errors.New("error: invalid password")
	}
	var query = `update admin set password = $1 where human_id = $2 returning true;`
	var result bool
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Password, assistant.UserId,
	).Scan(&result); err != nil {
		log.Println(err)
		return &pb.AdminUpdatePassOutput{}, err
	}
	return &pb.AdminUpdatePassOutput{}, nil
}

func CreateAuthService(app *modules.App) {

	// tables
	app.Database.ExecuteSqlFile("shell/database/tables/admin.sql")
	app.Database.ExecuteSqlFile("shell/database/tables/human.sql")
	app.Database.ExecuteSqlFile("shell/database/tables/session.sql")

	// Functipns
	app.Database.ExecuteSqlFile("shell/database/functions/admins/signin.sql")

	// Methods
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_auths.SigninDto, dtos_auths.SigninDto](
			"/auths/signin",
			signin,
			dtos_auths.SigninDto{},
			modules.CreateCheck(false, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_auths.UpdatePassDto, dtos_auths.UpdatePassDto](
			"/auths/updatePass",
			updatePass,
			dtos_auths.UpdatePassDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
}

func LoadAuthGrpcService(gs *grpc.Server) {
	type server struct {
		pb.UnimplementedHumanServiceServer
	}
	pb.RegisterHumanServiceServer(gs, &server{})
}
