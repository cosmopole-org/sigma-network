package services

import (
	"context"
	"errors"
	"fmt"
	"sigma/main/core/types"
	updates_workers "sigma/main/core/updates/workers"

	pb "sigma/main/core/grpc"
)

func createWorker(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.WorkerCreateDto)
	var query = `
		insert into worker (
			machine_id,
			room_id,
			metadata
		) values ($1, $2, $3)
		returning id;
	`
	var worker pb.Worker
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.MachineId, assistant.RoomId, input.Metadata,
	).Scan(&worker.Id); err != nil {
		fmt.Println(err)
		return &pb.WorkerCreateOutput{}, err
	}
	if worker.Id > 0 {
		worker.MachineId = input.MachineId
		worker.RoomId = assistant.RoomId
		worker.Metadata = input.Metadata
	}
	app.Memory.Put(fmt.Sprintf("worker::%d", worker.Id), fmt.Sprintf("%d/%d", worker.RoomId, worker.MachineId))
	return &pb.WorkerCreateOutput{Worker: &worker}, nil
}

func updateWorker(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.WorkerUpdateDto)
	var query = `
		update worker set metadata = $1 where id = $2 and room_id = $3
		returning id, machine_id;
	`
	var worker pb.Worker
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Metadata, input.WorkerId, assistant.RoomId,
	).Scan(&worker.Id, &worker.MachineId); err != nil {
		fmt.Println(err)
		return &pb.WorkerUpdateOutput{}, err
	}
	if worker.Id > 0 {
		worker.Id = input.WorkerId
		worker.RoomId = assistant.RoomId
		worker.Metadata = input.Metadata
		return &pb.WorkerUpdateOutput{Worker: &worker}, nil
	} else {
		return &pb.WorkerUpdateOutput{}, errors.New("worker not found")
	}
}

func deleteWorker(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.WorkerDeleteDto)
	query := `
		delete from worker where id = $1 and room_id = $2 returning true;
	`
	var result bool
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.WorkerId, assistant.RoomId,
	).Scan(&result); err != nil {
		fmt.Println(err)
		return &pb.WorkerDeleteOutput{}, err
	}
	return &pb.WorkerDeleteOutput{}, nil
}

func readWorkers(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var query = `
		select id, machine_id, room_id, metadata from worker where room_id = $1;
	`
	rows, err := app.Database.Db.Query(context.Background(), query, assistant.RoomId)
	if err != nil {
		fmt.Println(err)
	}
	var rowSlice []*pb.Worker
	for rows.Next() {
		var w pb.Worker
		err := rows.Scan(&w.Id, &w.MachineId, &w.RoomId, &w.Metadata)
		if err != nil {
			fmt.Println(err)
		}
		rowSlice = append(rowSlice, &w)
	}
	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}
	return &pb.WorkerReadOutput{Workers: rowSlice}, nil
}

func deliver(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.WorkerDeliverDto)
	var query = `
		select * from workers_deliver($1, $2, $3, $4, $5);
	`
	var allowed = false
	var machineId int64 = 0
	var workerId int64 = 0
	if assistant.UserType == "human" {
		workerId = input.WorkerId
	} else if assistant.UserType == "machine" {
		workerId = assistant.WorkerId
	}
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, assistant.UserType, workerId, assistant.TowerId, assistant.RoomId,
	).Scan(&allowed, &machineId); err != nil {
		fmt.Println(err)
		return &pb.WorkerDeliverOutput{}, err
	}
	if allowed {
		if assistant.UserType == "human" {
			var p = updates_workers.Delivery{TowerId: assistant.TowerId, RoomId: assistant.RoomId, WorkerId: input.WorkerId, MachineId: machineId, UserId: assistant.UserId, Data: input.Data}
			app.Network.PusherServer.PushToUser(machineId, p)
		} else if assistant.UserType == "machine" {
			if input.UserId > 0 {
				var p = updates_workers.Delivery{TowerId: assistant.TowerId, RoomId: assistant.RoomId, WorkerId: input.WorkerId, MachineId: assistant.UserId, UserId: input.UserId, Data: input.Data}
				app.Network.PusherServer.PushToUser(input.UserId, p)
			} else {
				var p = updates_workers.Delivery{TowerId: assistant.TowerId, RoomId: assistant.RoomId, WorkerId: input.WorkerId, MachineId: assistant.UserId, Data: input.Data}
				app.Network.PusherServer.PushToGroup(assistant.TowerId, p, []int64{})
			}
		}
	}
	return &pb.WorkerDeliverOutput{Passed: allowed}, nil
}

func CreateWorkerService(app *types.App) *types.Service {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/worker.sql")

	// Functions
	app.Database.ExecuteSqlFile("core/database/functions/workers/deliver.sql")

	var s = types.CreateService(app, "sigma.WorkerService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedWorkerServiceServer
		}
		pb.RegisterWorkerServiceServer(app.Network.GrpcServer, &server{})
	})
	s.AddMethod(types.CreateMethod("create", createWorker, types.CreateCheck(true, true, true), pb.WorkerCreateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("update", updateWorker, types.CreateCheck(true, true, true), pb.WorkerUpdateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("delete", deleteWorker, types.CreateCheck(true, true, true), pb.WorkerDeleteDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("read", readWorkers, types.CreateCheck(true, true, true), pb.WorkerReadDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("deliver", deliver, types.CreateCheck(true, true, true), pb.WorkerDeliverDto{}, types.CreateMethodOptions(true, false)))

	return s
}
