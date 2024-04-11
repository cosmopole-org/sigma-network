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
	updates_workers "sigma/core/src/updates/workers"
	"sigma/core/src/utils"
)

func createWorker(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_workers.CreateDto)
	var query = `
		insert into worker (
			machine_id,
			room_id,
			metadata
		) values ($1, $2, $3)
		returning id;
	`
	var worker models.Worker
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.MachineId, assistant.GetRoomId(), input.Metadata,
	).Scan(&worker.Id); err != nil {
		fmt.Println(err)
		return outputs_workers.CreateOutput{}, err
	}
	if worker.Id > 0 {
		worker.MachineId = input.MachineId
		worker.RoomId = assistant.GetRoomId()
		worker.Metadata = input.Metadata
	}
	app.GetMemory().Put(fmt.Sprintf("worker::%d", worker.Id), fmt.Sprintf("%d/%d", worker.RoomId, worker.MachineId))
	return outputs_workers.CreateOutput{Worker: worker}, nil
}

func updateWorker(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_workers.UpdateDto)
	var query = `
		update worker set metadata = $1 where id = $2 and room_id = $3
		returning id, machine_id;
	`
	var worker models.Worker
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Metadata, input.WorkerId, assistant.GetRoomId(),
	).Scan(&worker.Id, &worker.MachineId); err != nil {
		fmt.Println(err)
		return outputs_workers.UpdateOutput{}, err
	}
	if worker.Id > 0 {
		worker.Id = input.WorkerId
		worker.RoomId = assistant.GetRoomId()
		worker.Metadata = input.Metadata
		return outputs_workers.UpdateOutput{Worker: worker}, nil
	} else {
		return outputs_workers.UpdateOutput{}, errors.New("worker not found")
	}
}

func deleteWorker(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_workers.DeleteDto)
	var query = ``
	query = `
		delete from worker where id = $1 and room_id = $2;
	`
	var id = 0
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.WorkerId, assistant.GetRoomId(),
	).Scan(&id); err != nil {
		fmt.Println(err)
		return outputs_workers.DeleteOutput{}, err
	}
	return outputs_workers.DeleteOutput{}, nil
}

func readWorkers(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var query = `
		select id, machine_id, room_id, metadata from worker where room_id = $1;
	`
	rows, err := app.GetDatabase().GetDb().Query(context.Background(), query, assistant.GetRoomId())
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

func deliver(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_workers.DeliverDto)
	var query = `
		select * from workers_deliver($1, $2, $3, $4, $5);
	`
	var allowed = false
	var machineId int64 = 0
	var workerId int64 = 0
	if assistant.GetUserType() == "human" {
		workerId = input.WorkerId
	} else if assistant.GetUserType() == "machine" {
		workerId = assistant.GetWorkerId()
	}
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), assistant.GetUserType(), workerId, assistant.GetTowerId(), assistant.GetRoomId(),
	).Scan(&allowed, &machineId); err != nil {
		fmt.Println(err)
		return outputs_workers.DeliverOutput{}, err
	}
	if allowed {
		if assistant.GetUserType() == "human" {
			var p = updates_workers.Delivery{TowerId: assistant.GetTowerId(), RoomId: assistant.GetRoomId(), WorkerId: input.WorkerId, MachineId: machineId, UserId: assistant.GetUserId(), Data: input.Data}
			app.GetNetwork().GetPusherServer().PushToUser(machineId, p)
		} else if assistant.GetUserType() == "machine" {
			if input.UserId > 0 {
				var p = updates_workers.Delivery{TowerId: assistant.GetTowerId(), RoomId: assistant.GetRoomId(), WorkerId: input.WorkerId, MachineId: assistant.GetUserId(), UserId: input.UserId, Data: input.Data}
				app.GetNetwork().GetPusherServer().PushToUser(input.UserId, p)
			} else {
				var p = updates_workers.Delivery{TowerId: assistant.GetTowerId(), RoomId: assistant.GetRoomId(), WorkerId: input.WorkerId, MachineId: assistant.GetUserId(), Data: input.Data}
				app.GetNetwork().GetPusherServer().PushToGroup(assistant.GetTowerId(), p, []int64{})
			}
		}
	}
	return outputs_workers.DeliverOutput{Passed: allowed}, nil
}

func CreateWorkerService(app interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/worker.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/workers/deliver.sql")

	var s = types.CreateService(app, "machines")
	s.AddMethod(types.CreateMethod("create", createWorker, types.CreateCheck(true, true, true), dtos_workers.CreateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("update", updateWorker, types.CreateCheck(true, true, true), dtos_workers.UpdateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("delete", deleteWorker, types.CreateCheck(true, true, true), dtos_workers.DeleteDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("read", readWorkers, types.CreateCheck(true, true, true), dtos_workers.ReadDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("deliver", deliver, types.CreateCheck(true, true, true), dtos_workers.DeliverDto{}, types.CreateMethodOptions(true, false)))

	return s
}
