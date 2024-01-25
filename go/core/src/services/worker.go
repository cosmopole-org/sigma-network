package services

import (
	"context"
	"errors"
	"fmt"
	dtos_workers "sigma/core/src/dtos/workers"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_workers "sigma/core/src/outputs/workers"
	"sigma/core/src/types"
	"sigma/core/src/utils"
)

func createWorker(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*dtos_workers.CreateDto)
	var query = `
		insert into worker (
			machine_id,
			room_id,
			metadata
		) values ($1, $2, $3)
		returning id;
	`
	var worker models.Worker
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.MachineId, guard.GetRoomId(), input.Metadata,
	).Scan(&worker.Id); err != nil {
		fmt.Println(err)
		return outputs_workers.CreateOutput{}, err
	}
	if worker.Id > 0 {
		worker.MachineId = input.MachineId
		worker.RoomId = guard.GetRoomId()
		worker.Metadata = input.Metadata
	}
	return outputs_workers.CreateOutput{Worker: worker}, nil
}

func updateWorker(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*dtos_workers.UpdateDto)
	var query = `
		update worker set metadata = $1 where id = $2 and room_id = $3
		returning id, machine_id;
	`
	var worker models.Worker
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Metadata, input.WorkerId, guard.GetRoomId(),
	).Scan(&worker.Id, &worker.MachineId); err != nil {
		fmt.Println(err)
		return outputs_workers.UpdateOutput{}, err
	}
	if worker.Id > 0 {
		worker.Id = input.WorkerId
		worker.RoomId = guard.GetRoomId()
		worker.Metadata = input.Metadata
		return outputs_workers.UpdateOutput{Worker: worker}, nil
	} else {
		return outputs_workers.UpdateOutput{}, errors.New("worker not found")
	}
}

func deleteWorker(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*dtos_workers.DeleteDto)
	var query = ``
	query = `
		delete from worker where id = $1 and room_id = $2;
	`
	var id = 0
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.WorkerId, guard.GetRoomId(),
	).Scan(&id); err != nil {
		fmt.Println(err)
		return outputs_workers.DeleteOutput{}, err
	}
	return outputs_workers.DeleteOutput{}, nil
}

func readWorkers(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var query = `
		select id, machine_id, room_id, metadata from worker where room_id = $1;
	`
	rows, err := (*app).GetDatabase().GetDb().Query(context.Background(), query, guard.GetRoomId())
	if err != nil {
		fmt.Println(err)
	}
	var rowSlice []any
	for rows.Next() {
		var w models.Worker
		err := rows.Scan(&w.Id, &w.MachineId, &w.RoomId, &w.Metadata)
		if err != nil {
			fmt.Println(err)
		}
		rowSlice = append(rowSlice, w)
	}
	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}
	return outputs_workers.GetOutput{Workers: rowSlice}, nil
}

func deliver(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*dtos_workers.DeliverDto)
	var query = `
		select * from workers_deliver($1, $2, $3, $4);
	`
	var allowed = false
	var userType = ""
	var machineId int64 = 0
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, guard.GetUserId(), input.WorkerId, guard.GetTowerId(), guard.GetRoomId(),
	).Scan(&allowed, &userType, &machineId); err != nil {
		fmt.Println(err)
		return outputs_workers.DeliverOutput{}, err
	}
	if (allowed) {
		if userType == "human" {
			(*app).GetNetwork().PushToUser(machineId, input.Data)
		} else {
			(*app).GetNetwork().PushToUser(guard.GetUserId(), input.Data)
		}
	}
	return outputs_workers.DeliverOutput{Passed: allowed}, nil
}

func CreateWorkerService(app *interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/worker.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/workers/deliver.sql")

	return types.CreateService("machines").
		AddMethod(types.CreateMethod("create", createWorker, types.CreateCheck(true, true, true), &dtos_workers.CreateDto{}, true)).
		AddMethod(types.CreateMethod("update", updateWorker, types.CreateCheck(true, true, true), &dtos_workers.UpdateDto{}, true)).
		AddMethod(types.CreateMethod("delete", deleteWorker, types.CreateCheck(true, true, true), &dtos_workers.DeleteDto{}, true)).
		AddMethod(types.CreateMethod("read", readWorkers, types.CreateCheck(true, true, true), &dtos_workers.ReadDto{}, true)).
		AddMethod(types.CreateMethod("deliver", deliver, types.CreateCheck(true, true, true), &dtos_workers.DeliverDto{}, true))
}
