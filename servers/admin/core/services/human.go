package services

import (
	"context"
	"fmt"

	dtos_humans "sigma/admin/core/dtos/humans"
	"sigma/admin/core/modules"
	"sigma/admin/core/utils"

	pb "sigma/admin/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func authenticate(app *modules.App, input dtos_humans.AuthenticateDto, assistant modules.Assistant) (any, error) {
	_, res, _ := app.Services.CallActionHonestly("/humans/get", dtos_humans.GetDto{UserId: assistant.UserId}, modules.Meta{UserId: 0, TowerId: 0, RoomId: 0})
	result := res.(*pb.HumanGetOutput)
	return &pb.HumanAuthenticateOutput{Authenticated: true, Me: result.Human}, nil
}

func signup(app *modules.App, input dtos_humans.SignupDto, assistant modules.Assistant) (any, error) {
	var cc, err1 = utils.SecureUniqueString(32)
	if err1 != nil {
		utils.Log(logrus.DebugLevel, err1)
		return &pb.HumanSignupOutput{}, err1
	}
	var vc, err2 = utils.SecureUniqueString(32)
	if err2 != nil {
		utils.Log(logrus.DebugLevel, err2)
		return &pb.HumanSignupOutput{}, err2
	}
	var query = `
		insert into pending
		(
			email,
			verify_code,
			client_code,
			state
		) values ($1, $2, $3, $4)
		on conflict(email) do update set verify_code = excluded.verify_code, state = $4
		returning id, email, verify_code, client_code, state;
	`
	var pending pb.Pending
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Email, vc, cc, "created",
	).Scan(&pending.Id, &pending.Email, &pending.VerifyCode, &pending.ClientCode, &pending.State); err != nil {
		utils.Log(logrus.DebugLevel, err)
		return &pb.HumanSignupOutput{}, err
	}
	return &pb.HumanSignupOutput{Pending: &pending}, nil
}

func verify(app *modules.App, input dtos_humans.VerifyDto, assistant modules.Assistant) (any, error) {
	var query = `
		select humans_verify($1, $2)
	`
	var record []interface{}
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.ClientCode, input.VerifyCode,
	).Scan(
		&record,
	); err != nil {
		utils.Log(logrus.DebugLevel, err)
		return &pb.HumanVerifyOutput{}, err
	}
	var pending = pb.Pending{
		Id:         record[0].(int64),
		ClientCode: record[1].(string),
		VerifyCode: record[2].(string),
		State:      record[3].(string),
		Email:      record[4].(string),
	}
	if record[5] == nil {
		return &pb.HumanVerifyOutput{Pending: &pending, Human: nil, Session: nil}, nil
	} else {
		var human = pb.Human{
			Id:        record[5].(int64),
			Email:     record[6].(string),
			FirstName: record[7].(string),
			LastName:  record[8].(string),
			Origin:    record[11].(string),
		}
		var session = pb.Session{
			Id:     record[9].(int64),
			UserId: human.Id,
			Token:  record[10].(string),
		}
		session.CreatureType = 1
		return &pb.HumanVerifyOutput{Pending: &pending, Human: &human, Session: &session}, nil
	}
}

func complete(app *modules.App, input dtos_humans.CompleteDto, assistant modules.Assistant) (any, error) {
	var human pb.Human
	var session pb.Session
	var token, tokenErr = utils.SecureUniqueString(32)
	if tokenErr != nil {
		utils.Log(logrus.DebugLevel, tokenErr)
		return &pb.HumanCompleteOutput{}, tokenErr
	}
	var query = `
		select * from humans_complete($1, $2, $3, $4, $5, $6)
	`
	if err := app.Database.Db.QueryRow(context.Background(), query, input.ClientCode, input.VerifyCode, input.FirstName, input.LastName, token, app.AppId).
		Scan(&human.Id, &human.Email, &human.FirstName, &human.LastName, &session.Id, &session.Token); err != nil {
		utils.Log(logrus.DebugLevel, err)
		return &pb.HumanCompleteOutput{}, err
	}
	if human.Id > 0 {
		human.Origin = app.AppId
		session.UserId = human.Id
		session.CreatureType = 1
	}
	app.Memory.Put("auth::"+session.Token, fmt.Sprintf("human/%d", human.Id))
	return &pb.HumanCompleteOutput{Human: &human, Session: &session}, nil
}

func update(app *modules.App, input dtos_humans.UpdateDto, assistant modules.Assistant) (any, error) {
	var human pb.Human
	var query = `
		update human set first_name = $1, last_name = $2 where id = $3
		returning id, email, first_name, last_name, origin;
	`
	if err := app.Database.Db.QueryRow(context.Background(), query, input.FirstName, input.LastName, assistant.UserId).
		Scan(&human.Id, &human.Email, &human.FirstName, &human.LastName, &human.Origin); err != nil {
		utils.Log(logrus.DebugLevel, err)
		return &pb.HumanUpdateOutput{}, err
	}
	return &pb.HumanUpdateOutput{Human: &human}, nil
}

func get(app *modules.App, input dtos_humans.GetDto, assistant modules.Assistant) (any, error) {
	var human pb.Human
	var query = `
		select id, first_name, last_name, origin from human where id = $1;
	`
	if err := app.Database.Db.QueryRow(context.Background(), query, input.UserId).
		Scan(&human.Id, &human.FirstName, &human.LastName, &human.Origin); err != nil {
		utils.Log(logrus.DebugLevel, err)
		return &pb.HumanGetOutput{}, err
	}
	return &pb.HumanGetOutput{Human: &human}, nil
}

func CreateHumanService(app *modules.App, coreAccess bool) {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/session.sql")
	app.Database.ExecuteSqlFile("core/database/tables/pending.sql")
	app.Database.ExecuteSqlFile("core/database/tables/human.sql")

	// Functipns
	app.Database.ExecuteSqlFile("core/database/functions/humans/complete.sql")
	app.Database.ExecuteSqlFile("core/database/functions/humans/verify.sql")

	// Methods
	app.Services.AddAction(modules.CreateAction(
		app,
		"/humans/authenticate",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		authenticate,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/humans/signup",
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		signup,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/humans/verify",
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		verify,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/humans/complete",
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		complete,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/humans/update",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		update,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/humans/get",
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
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
