package services

import (
	"context"
	"errors"
	"fmt"
	dtos_workers "sigma/storage/core/dtos/workers"
	"sigma/storage/core/models"
	"sigma/storage/core/runtime"
	updates_workers "sigma/storage/core/updates/workers"
	"sigma/storage/core/utils"

	pb "sigma/storage/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createWorker(app *runtime.App, input dtos_workers.CreateDto, assistant models.Assistant) (any, error) {
	var query = `
		insert into worker (
			machine_id,
			room_id,
			metadata,
			origin,
			user_origin
		) values ($1, $2, $3, $4, $5)
		returning id;
	`
	var worker pb.Worker
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.MachineId, assistant.RoomId, input.Metadata, app.AppId, input.WorkerOrigin,
	).Scan(&worker.Id); err != nil {
		utils.Log(5, err)
		return &pb.WorkerCreateOutput{}, err
	}
	if worker.Id > 0 {
		worker.MachineId = input.MachineId
		worker.RoomId = assistant.RoomId
		worker.Metadata = input.Metadata
		worker.Origin = app.AppId
		worker.UserOrigin = input.WorkerOrigin
	}
	app.Managers.MemoryManager().Put(fmt.Sprintf("worker::%d", worker.Id), fmt.Sprintf("%d/%d/%s", worker.RoomId, worker.MachineId, input.WorkerOrigin))
	go app.Managers.PushManager().PushToGroup("workers/create", assistant.TowerId, updates_workers.Create{TowerId: assistant.TowerId, Worker: &worker},
		[]models.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
	return &pb.WorkerCreateOutput{Worker: &worker}, nil
}

func updateWorker(app *runtime.App, input dtos_workers.UpdateDto, assistant models.Assistant) (any, error) {
	var query = `
		update worker set metadata = $1 where id = $2 and room_id = $3
		returning id, machine_id, origin;
	`
	var worker pb.Worker
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.Metadata, input.WorkerId, assistant.RoomId,
	).Scan(&worker.Id, &worker.MachineId, &worker.Origin); err != nil {
		utils.Log(5, err)
		return &pb.WorkerUpdateOutput{}, err
	}
	if worker.Id > 0 {
		worker.RoomId = assistant.RoomId
		worker.Metadata = input.Metadata
		return &pb.WorkerUpdateOutput{Worker: &worker}, nil
	} else {
		return &pb.WorkerUpdateOutput{}, errors.New("worker not found")
	}
}

func deleteWorker(app *runtime.App, input dtos_workers.DeleteDto, assistant models.Assistant) (any, error) {
	query := `
		delete from worker where id = $1 and room_id = $2 returning true;
	`
	var result bool
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.WorkerId, assistant.RoomId,
	).Scan(&result); err != nil {
		utils.Log(5, err)
		return &pb.WorkerDeleteOutput{}, err
	}
	return &pb.WorkerDeleteOutput{}, nil
}

func readWorkers(app *runtime.App, input dtos_workers.ReadDto, assistant models.Assistant) (any, error) {
	var query = `
		select id, machine_id, room_id, metadata, origin from worker where room_id = $1;
	`
	rows, err := app.Managers.DatabaseManager().Db.Query(context.Background(), query, assistant.RoomId)
	if err != nil {
		utils.Log(5, err)
	}
	var rowSlice []*pb.Worker
	for rows.Next() {
		var w pb.Worker
		err := rows.Scan(&w.Id, &w.MachineId, &w.RoomId, &w.Metadata, &w.Origin)
		if err != nil {
			utils.Log(5, err)
		}
		rowSlice = append(rowSlice, &w)
	}
	if err := rows.Err(); err != nil {
		utils.Log(5, err)
	}
	return &pb.WorkerReadOutput{Workers: rowSlice}, nil
}

func CreateWorkerService(app *runtime.App, coreAccess bool) {

	// Tables
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/worker.sql")

	// Functions
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/workers/deliver.sql")

	// Methods

	app.Services.AddAction(runtime.CreateAction(
		app,
		"/workers/create",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		createWorker,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/workers/update",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		updateWorker,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/workers/delete",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodDelete),
		true,
		deleteWorker,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/workers/read",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		readWorkers,
	))
}

func LoadWorkerGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedWorkerServiceServer
	}
	pb.RegisterWorkerServiceServer(grpcServer, &server{})
}
