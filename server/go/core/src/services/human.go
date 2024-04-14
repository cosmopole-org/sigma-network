package services

import (
	"context"
	"fmt"
	"strconv"

	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	pb "sigma/core/src/grpc"
)

func signup(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.HumanSignupDto)
	var cc, err1 = utils.SecureUniqueString(32)
	if err1 != nil {
		fmt.Println(err1)
		return &pb.HumanSignupOutput{}, err1
	}
	var vc, err2 = utils.SecureUniqueString(32)
	if err2 != nil {
		fmt.Println(err2)
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
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Email, vc, cc, "created",
	).Scan(&pending.Id, &pending.Email, &pending.VerifyCode, &pending.ClientCode, &pending.State); err != nil {
		fmt.Println(err)
		return &pb.HumanSignupOutput{}, err
	}
	return &pb.HumanSignupOutput{Pending: &pending}, nil
}

func verify(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.HumanVerifyDto)
	var query = `
		select humans_verify($1, $2)
	`
	var record []interface{}
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.ClientCode, input.VerifyCode,
	).Scan(
		&record,
	); err != nil {
		fmt.Println(err)
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

func complete(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.HumanCompleteDto)
	var human pb.Human
	var session pb.Session
	var token, tokenErr = utils.SecureUniqueString(32)
	if tokenErr != nil {
		fmt.Println(tokenErr)
		return &pb.HumanCompleteOutput{}, tokenErr
	}
	var query = `
		select * from humans_complete($1, $2, $3, $4, $5)
	`
	if err := app.GetDatabase().GetDb().QueryRow(context.Background(), query, input.ClientCode, input.VerifyCode, input.FirstName, input.LastName, token).
		Scan(&human.Id, &human.Email, &human.FirstName, &human.LastName, &session.Id, &session.Token); err != nil {
		fmt.Println(err)
		return &pb.HumanCompleteOutput{}, err
	}
	if human.Id > 0 {
		session.UserId = human.Id
		session.CreatureType = 1
	}
	app.GetMemory().Put("auth::"+session.Token, fmt.Sprintf("human/%d", human.Id))
	return &pb.HumanCompleteOutput{Human: &human, Session: &session}, nil
}

func update(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.HumanUpdateDto)
	var human pb.Human
	var query = `
		update human set first_name = $1, last_name = $2 where id = $3
		returning id, email, first_name, last_name;
	`
	if err := app.GetDatabase().GetDb().QueryRow(context.Background(), query, input.FirstName, input.LastName, assistant.GetUserId()).
		Scan(&human.Id, &human.Email, &human.FirstName, &human.LastName); err != nil {
		fmt.Println(err)
		return &pb.HumanUpdateOutput{}, err
	}
	return &pb.HumanUpdateOutput{Human: &human}, nil
}

func get(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.HumanGetDto)
	var human pb.Human
	var query = `
		select id, first_name, last_name from human where id = $1;
	`
	userId, err := strconv.ParseInt(input.UserId, 10, 64)
	if err != nil {
		fmt.Println(err)
		return &pb.HumanGetOutput{}, err
	}
	if err := app.GetDatabase().GetDb().QueryRow(context.Background(), query, userId).
		Scan(&human.Id, &human.FirstName, &human.LastName); err != nil {
		fmt.Println(err)
		return &pb.HumanGetOutput{}, err
	}
	return &pb.HumanGetOutput{Human: &human}, nil
}

func CreateHumanService(app interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/session.sql")
	utils.ExecuteSqlFile("src/database/tables/pending.sql")
	utils.ExecuteSqlFile("src/database/tables/human.sql")

	// Functipns
	utils.ExecuteSqlFile("src/database/functions/humans/complete.sql")
	utils.ExecuteSqlFile("src/database/functions/humans/verify.sql")

	var s = types.CreateService(app, "sigma.HumanService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedHumanServiceServer
		}
		pb.RegisterHumanServiceServer(app.GetNetwork().GetGrpcServer(), &server{})
	})
	s.AddMethod(types.CreateMethod("signup", signup, types.CreateCheck(false, false, false), pb.HumanSignupDto{}, types.CreateMethodOptions(true, true)))
	s.AddMethod(types.CreateMethod("verify", verify, types.CreateCheck(false, false, false), pb.HumanVerifyDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("complete", complete, types.CreateCheck(false, false, false), pb.HumanCompleteDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("update", update, types.CreateCheck(true, false, false), pb.HumanUpdateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("get", get, types.CreateCheck(false, false, false), pb.HumanGetDto{}, types.CreateMethodOptions(true, false)))

	return s
}
