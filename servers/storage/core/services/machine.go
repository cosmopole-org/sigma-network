package services

import (
	"context"
	"fmt"
	dtos_machines "sigma/storage/core/dtos/machines"
	"sigma/storage/core/modules"
	"sigma/storage/core/utils"
	"strconv"

	pb "sigma/storage/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createMachine(app *modules.App, input dtos_machines.CreateDto, assistant modules.Assistant) (any, error) {
	var token, err1 = utils.SecureUniqueString(32)
	if err1 != nil {
		utils.Log(5, err1)
		return &pb.MachineCreateOutput{}, err1
	}
	var query = `
		select * from machines_create($1, $2, $3, $4, $5);
	`
	var machine pb.Machine
	var session pb.Session
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.Name, input.AvatarId, token, app.AppId,
	).Scan(&machine.Id, &session.Id); err != nil {
		utils.Log(5, err)
		return &pb.MachineCreateOutput{}, err
	}
	if machine.Id > 0 {
		machine.Name = input.Name
		machine.AvatarId = input.AvatarId
		machine.CreatorId = assistant.UserId
		machine.Origin = app.AppId
		session.UserId = machine.Id
		session.Token = token
		session.CreatureType = 2
	}
	app.Memory.Put("auth::"+session.Token, fmt.Sprintf("machine/%d", machine.Id))
	return &pb.MachineCreateOutput{Machine: &machine, Session: &session}, nil
}

func updateMachine(app *modules.App, input dtos_machines.UpdateDto, assistant modules.Assistant) (any, error) {
	var query = `
		update machine set name = $1, avatar_id = $2 where id = $3 and creator_id = $4
		returning id, name, avatar_id, creator_id, origin;
	`
	var machine pb.Machine
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.MachineId, assistant.UserId,
	).Scan(&machine.Id, &machine.Name, &machine.AvatarId, &machine.CreatorId, &machine.Origin); err != nil {
		utils.Log(5, err)
		return &pb.MachineUpdateOutput{}, err
	}
	return &pb.MachineUpdateOutput{Machine: &machine}, nil
}

func deleteMachine(app *modules.App, input dtos_machines.DeleteDto, assistant modules.Assistant) (any, error) {
	var query = ``
	query = `
		select * from machines_delete($1, $2);
	`
	var id = 0
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.MachineId,
	).Scan(&id); err != nil {
		utils.Log(5, err)
		return &pb.MachineDeleteOutput{}, err
	}
	return &pb.MachineDeleteOutput{}, nil
}

func getMachine(app *modules.App, input dtos_machines.GetDto, assistant modules.Assistant) (any, error) {
	machineId, err := strconv.ParseInt(input.MachineId, 10, 64)
	if err != nil {
		utils.Log(5, err)
		return &pb.MachineGetOutput{}, err
	}
	var query = `
		select * from machines_get($1, $2);
	`
	var machine pb.Machine
	var session pb.Session
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, machineId,
	).Scan(&machine.Id, &machine.Name, &machine.AvatarId, &machine.CreatorId, &session.Id, &session.Token, &machine.Origin); err != nil {
		utils.Log(5, err)
		return &pb.MachineGetOutput{}, err
	}
	if machine.CreatorId != assistant.UserId {
		machine.CreatorId = 0
		session.Token = ""
		session.Id = 0
	} else {
		session.UserId = machine.Id
	}
	return &pb.MachineGetOutput{Machine: &machine, Session: &session}, nil
}

func CreateMachineService(app *modules.App, coreAccess bool) {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/machine.sql")

	// Functions
	app.Database.ExecuteSqlFile("core/database/functions/machines/create.sql")
	app.Database.ExecuteSqlFile("core/database/functions/machines/delete.sql")
	app.Database.ExecuteSqlFile("core/database/functions/machines/get.sql")

	// Methods
	app.Services.AddAction(modules.CreateAction(
		app,
		"/machines/create",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		createMachine,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/machines/update",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		updateMachine,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/machines/delete",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodDelete),
		true,
		deleteMachine,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/machines/get",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getMachine,
	))
}

func LoadMachineGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedMachineServiceServer
	}
	pb.RegisterMachineServiceServer(grpcServer, &server{})
}
