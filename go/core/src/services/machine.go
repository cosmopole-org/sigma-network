package services

import (
	"context"
	"fmt"
	dtos_machines "sigma/core/src/dtos/machines"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_machines "sigma/core/src/outputs/machines"
	"sigma/core/src/types"
	"sigma/core/src/utils"
	"strconv"
)

func createMachine(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*dtos_machines.CreateDto)
	var token, err1 = utils.SecureUniqueString(32)
	if err1 != nil {
		fmt.Println(err1)
		return outputs_machines.CreateOutput{}, err1
	}
	var query = `
		select * from machines_create($1, $2, $3, $4);
	`
	var machine models.Machine
	var Session models.Session
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, guard.GetUserId(), input.Name, input.AvatarId, token,
	).Scan(&machine.Id, &Session.Id); err != nil {
		fmt.Println(err)
		return outputs_machines.CreateOutput{}, err
	}
	if machine.Id > 0 {
		machine.Name = input.Name
		machine.AvatarId = input.AvatarId
		machine.CreatorId = guard.GetUserId()
		Session.UserId = machine.Id
		Session.Token = token
	}
	return outputs_machines.CreateOutput{Machine: machine, Session: Session}, nil
}

func updateMachine(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*dtos_machines.UpdateDto)
	var query = `
		update machine set name = $1, avatar_id = $2 where id = $3 and creator_id = $4
		returning id, name, avatar_id, creator_id;
	`
	var machine models.Machine
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.MachineId, guard.GetUserId(),
	).Scan(&machine.Id, &machine.Name, &machine.AvatarId, &machine.CreatorId); err != nil {
		fmt.Println(err)
		return outputs_machines.UpdateOutput{}, err
	}
	return outputs_machines.UpdateOutput{Machine: machine}, nil
}

func deleteMachine(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*dtos_machines.DeleteDto)
	var query = ``
	query = `
		select * from machines_delete($1, $2);
	`
	var id = 0
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, guard.GetUserId(), input.MachineId,
	).Scan(&id); err != nil {
		fmt.Println(err)
		return outputs_machines.DeleteOutput{}, err
	}
	return outputs_machines.DeleteOutput{}, nil
}

func getMachine(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*dtos_machines.GetDto)
	machineId, err := strconv.ParseInt(input.MachineId, 10, 64)
	if err != nil {
		fmt.Println(err)
		return outputs_machines.GetOutput{}, err
	}
	var query = `
		select * from machines_get($1, $2);
	`
	var machine models.Machine
	var session models.Session
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, guard.GetUserId(), machineId,
	).Scan(&machine.Id, &machine.Name, &machine.AvatarId, &machine.CreatorId, &session.Id, &session.Token); err != nil {
		fmt.Println(err)
		return outputs_machines.GetOutput{}, err
	}
	if (machine.CreatorId != guard.GetUserId()) {
		machine.CreatorId = 0
		session.Token = ""
		session.Id = 0
	} else {
		session.UserId = machine.Id
	}
	return outputs_machines.GetOutput{Machine: machine, Session: session}, nil
}

func CreateMachineService(app *interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/machine.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/machines/create.sql")
	utils.ExecuteSqlFile("src/database/functions/machines/delete.sql")
	utils.ExecuteSqlFile("src/database/functions/machines/get.sql")

	return types.CreateService("machines").
		AddMethod(types.CreateMethod("create", createMachine, types.CreateCheck(true, false, false), &dtos_machines.CreateDto{})).
		AddMethod(types.CreateMethod("update", updateMachine, types.CreateCheck(true, false, false), &dtos_machines.UpdateDto{})).
		AddMethod(types.CreateMethod("delete", deleteMachine, types.CreateCheck(true, false, false), &dtos_machines.DeleteDto{})).
		AddMethod(types.CreateMethod("get", getMachine, types.CreateCheck(true, false, false), &dtos_machines.GetDto{}))
}
