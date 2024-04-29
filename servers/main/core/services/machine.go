package services

import (
	"context"
	"fmt"
	"sigma/main/core/types"
	"sigma/main/core/utils"
	"strconv"

	pb "sigma/main/core/grpc"
)

func createMachine(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.MachineCreateDto)
	var token, err1 = utils.SecureUniqueString(32)
	if err1 != nil {
		fmt.Println(err1)
		return &pb.MachineCreateOutput{}, err1
	}
	var query = `
		select * from machines_create($1, $2, $3, $4);
	`
	var machine pb.Machine
	var session pb.Session
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.Name, input.AvatarId, token,
	).Scan(&machine.Id, &session.Id); err != nil {
		fmt.Println(err)
		return &pb.MachineCreateOutput{}, err
	}
	if machine.Id > 0 {
		machine.Name = input.Name
		machine.AvatarId = input.AvatarId
		machine.CreatorId = assistant.UserId
		session.UserId = machine.Id
		session.Token = token
		session.CreatureType = 2
	}
	app.Memory.Put("auth::"+session.Token, fmt.Sprintf("machine/%d", machine.Id))
	return &pb.MachineCreateOutput{Machine: &machine, Session: &session}, nil
}

func updateMachine(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.MachineUpdateDto)
	var query = `
		update machine set name = $1, avatar_id = $2 where id = $3 and creator_id = $4
		returning id, name, avatar_id, creator_id;
	`
	var machine pb.Machine
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.MachineId, assistant.UserId,
	).Scan(&machine.Id, &machine.Name, &machine.AvatarId, &machine.CreatorId); err != nil {
		fmt.Println(err)
		return &pb.MachineUpdateOutput{}, err
	}
	return &pb.MachineUpdateOutput{Machine: &machine}, nil
}

func deleteMachine(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.MachineDeleteDto)
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

func getMachine(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.MachineGetDto)
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
	).Scan(&machine.Id, &machine.Name, &machine.AvatarId, &machine.CreatorId, &session.Id, &session.Token); err != nil {
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

func CreateMachineService(app *types.App) *types.Service {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/machine.sql")

	// Functions
	app.Database.ExecuteSqlFile("core/database/functions/machines/create.sql")
	app.Database.ExecuteSqlFile("core/database/functions/machines/delete.sql")
	app.Database.ExecuteSqlFile("core/database/functions/machines/get.sql")

	var s = types.CreateService(app, "sigma.MachineService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedMachineServiceServer
		}
		pb.RegisterMachineServiceServer(app.Network.GrpcServer, &server{})
	})
	s.AddMethod(types.CreateMethod("create", createMachine, types.CreateCheck(true, false, false), pb.MachineCreateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("update", updateMachine, types.CreateCheck(true, false, false), pb.MachineUpdateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("delete", deleteMachine, types.CreateCheck(true, false, false), pb.MachineDeleteDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("get", getMachine, types.CreateCheck(true, false, false), pb.MachineGetDto{}, types.CreateMethodOptions(true, false)))
	return s
}
