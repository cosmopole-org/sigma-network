package services

import (
	"context"
	"errors"
	"fmt"
	"sigma/main/core/modules"
	dtos_workers "sigma/main/shell/dtos/workers"
	updates_workers "sigma/main/shell/updates/workers"

	pb "sigma/main/shell/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createWorker(app *modules.App, input dtos_workers.CreateDto, assistant modules.Assistant) (any, error) {
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
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.MachineId, assistant.RoomId, input.Metadata, app.AppId, input.WorkerOrigin,
	).Scan(&worker.Id); err != nil {
		fmt.Println(err)
		return &pb.WorkerCreateOutput{}, err
	}
	if worker.Id > 0 {
		worker.MachineId = input.MachineId
		worker.RoomId = assistant.RoomId
		worker.Metadata = input.Metadata
		worker.Origin = app.AppId
		worker.UserOrigin = input.WorkerOrigin
	}
	app.Memory.Put(fmt.Sprintf("worker::%d", worker.Id), fmt.Sprintf("%d/%d/%s", worker.RoomId, worker.MachineId, input.WorkerOrigin))
	go app.Network.PusherServer.PushToGroup("workers/create", assistant.TowerId, updates_workers.Create{TowerId: assistant.TowerId, Worker: &worker},
		[]modules.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
	return &pb.WorkerCreateOutput{Worker: &worker}, nil
}

func updateWorker(app *modules.App, input dtos_workers.UpdateDto, assistant modules.Assistant) (any, error) {
	var query = `
		update worker set metadata = $1 where id = $2 and room_id = $3
		returning id, machine_id, origin;
	`
	var worker pb.Worker
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Metadata, input.WorkerId, assistant.RoomId,
	).Scan(&worker.Id, &worker.MachineId, &worker.Origin); err != nil {
		fmt.Println(err)
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

func deleteWorker(app *modules.App, input dtos_workers.DeleteDto, assistant modules.Assistant) (any, error) {
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

func readWorkers(app *modules.App, input dtos_workers.ReadDto, assistant modules.Assistant) (any, error) {
	var query = `
		select id, machine_id, room_id, metadata, origin from worker where room_id = $1;
	`
	rows, err := app.Database.Db.Query(context.Background(), query, assistant.RoomId)
	if err != nil {
		fmt.Println(err)
	}
	var rowSlice []*pb.Worker
	for rows.Next() {
		var w pb.Worker
		err := rows.Scan(&w.Id, &w.MachineId, &w.RoomId, &w.Metadata, &w.Origin)
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

func CreateWorkerService(app *modules.App) {

	// Tables
	app.Database.ExecuteSqlFile("shell/database/tables/worker.sql")

	// Functions
	app.Database.ExecuteSqlFile("shell/database/functions/workers/deliver.sql")

	// Methods
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_workers.CreateDto, dtos_workers.CreateDto](
			"/workers/create",
			createWorker,
			dtos_workers.CreateDto{},
			modules.CreateCheck(true, true, true),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, true),
			modules.CreateInterFedOptions(false, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_workers.UpdateDto, dtos_workers.UpdateDto](
			"/workers/update",
			updateWorker,
			dtos_workers.UpdateDto{},
			modules.CreateCheck(true, true, true),
			modules.CreateMethodOptions(true, fiber.MethodPut, true, true),
			modules.CreateInterFedOptions(false, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_workers.DeleteDto, dtos_workers.DeleteDto](
			"/workers/delete",
			deleteWorker,
			dtos_workers.DeleteDto{},
			modules.CreateCheck(true, true, true),
			modules.CreateMethodOptions(true, fiber.MethodDelete, true, true),
			modules.CreateInterFedOptions(false, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_workers.ReadDto, dtos_workers.ReadDto](
			"/workers/read",
			readWorkers,
			dtos_workers.ReadDto{},
			modules.CreateCheck(true, true, true),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, true),
			modules.CreateInterFedOptions(false, false)),
	)
}

func LoadWorkerGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedWorkerServiceServer
	}
	pb.RegisterWorkerServiceServer(grpcServer, &server{})
}
