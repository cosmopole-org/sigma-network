package services

import (
	"context"
	"fmt"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	dtos_machines "sigma/main/shell/dtos/machines"
	"strconv"

	pb "sigma/main/shell/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createMachine(app *modules.App, input dtos_machines.CreateDto, assistant modules.Assistant) (any, error) {
	var token, err1 = utils.SecureUniqueString(32)
	if err1 != nil {
		fmt.Println(err1)
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
		fmt.Println(err)
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
		fmt.Println(err)
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
		fmt.Println(err)
		return &pb.MachineDeleteOutput{}, err
	}
	return &pb.MachineDeleteOutput{}, nil
}

func getMachine(app *modules.App, input dtos_machines.GetDto, assistant modules.Assistant) (any, error) {
	machineId, err := strconv.ParseInt(input.MachineId, 10, 64)
	if err != nil {
		fmt.Println(err)
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
		fmt.Println(err)
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

func CreateMachineService(app *modules.App) {

	// Tables
	app.Database.ExecuteSqlFile("shell/database/tables/machine.sql")

	// Functions
	app.Database.ExecuteSqlFile("shell/database/functions/machines/create.sql")
	app.Database.ExecuteSqlFile("shell/database/functions/machines/delete.sql")
	app.Database.ExecuteSqlFile("shell/database/functions/machines/get.sql")

	// Methods
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_machines.CreateDto, dtos_machines.CreateDto](
			"/machines/create",
			createMachine,
			dtos_machines.CreateDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_machines.UpdateDto, dtos_machines.UpdateDto](
			"/machines/update",
			updateMachine,
			dtos_machines.UpdateDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPut, true, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_machines.DeleteDto, dtos_machines.DeleteDto](
			"/machines/delete",
			deleteMachine,
			dtos_machines.DeleteDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodDelete, true, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_machines.GetDto, dtos_machines.GetDto](
			"/machines/get",
			getMachine,
			dtos_machines.GetDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
		),
	)
}

func LoadMachineGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedMachineServiceServer
	}
	pb.RegisterMachineServiceServer(grpcServer, &server{})
}
