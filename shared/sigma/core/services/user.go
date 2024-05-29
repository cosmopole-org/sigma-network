package services

import (
	"context"
	"fmt"

	inputs_users "sigma/main/core/inputs/users"
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	"sigma/main/core/utils"

	pb "sigma/main/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func authenticate(app *runtime.App, input inputs_users.AuthenticateInput, info models.Info) (any, error) {
	_, res, _ := app.Services.CallActionHonestly("/humans/get", inputs_users.GetInput{UserId: info.User.Id}, runtime.Meta{UserId: 0, SpaceId: 0, TopicId: 0})
	result := res.(*pb.HumanGetOutput)
	return &pb.HumanAuthenticateOutput{Authenticated: true, Me: result.Human}, nil
}

func update(app *runtime.App, input inputs_users.UpdateInput, info models.Info) (any, error) {
	var human pb.Human
	var query = `
		update human set first_name = $1, last_name = $2 where id = $3
		returning id, email, first_name, last_name, origin;
	`
	if err := app.Managers.DatabaseManager().Db.QueryRow(context.Background(), query, input.FirstName, input.LastName, info.UserId).
		Scan(&human.Id, &human.Email, &human.FirstName, &human.LastName, &human.Origin); err != nil {
		utils.Log(5, err)
		return &pb.HumanUpdateOutput{}, err
	}
	return &pb.HumanUpdateOutput{Human: &human}, nil
}

func get(app *runtime.App, input inputs_users.GetInput, info models.Info) (any, error) {
	var human pb.Human
	var query = `
		select id, first_name, last_name, origin from human where id = $1;
	`
	if err := app.Managers.DatabaseManager().Db.QueryRow(context.Background(), query, input.UserId).
		Scan(&human.Id, &human.FirstName, &human.LastName, &human.Origin); err != nil {
		utils.Log(5, err)
		return &pb.HumanGetOutput{}, err
	}
	return &pb.HumanGetOutput{Human: &human}, nil
}

func CreateHumanService(app *runtime.App, coreAccess bool) {

	// Tables
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/session.sql")
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/pending.sql")
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/human.sql")

	// Functipns
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/humans/complete.sql")
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/humans/verify.sql")

	// Methods
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/humans/authenticate",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		authenticate,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/humans/signup",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		signup,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/humans/verify",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		verify,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/humans/complete",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		complete,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/humans/update",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		update,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/humans/get",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		get,
	))
}

func LoadHumanGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedHumanServiceServer
	}
	pb.RegisterHumanServiceServer(grpcServer, &server{})
}
