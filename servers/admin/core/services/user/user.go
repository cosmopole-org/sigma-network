package services_user

import (
	"fmt"
	inputs_users "sigma/admin/core/inputs/users"
	"sigma/admin/core/models"
	outputs_users "sigma/admin/core/outputs/users"
	"sigma/admin/core/runtime"
	"sigma/admin/core/utils"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func authenticate(app *runtime.App, input inputs_users.AuthenticateInput, info models.Info) (any, error) {
	_, res, _ := app.Services.CallActionHonestly("/humans/get", inputs_users.GetInput{UserId: info.User.Id}, runtime.Meta{UserId: 0, SpaceId: 0, TopicId: 0})
	result := res.(*outputs_users.GetOutput)
	return outputs_users.AuthenticateOutput{Authenticated: true, User: result.User}, nil
}

func create(app *runtime.App, input inputs_users.CreateInput, info models.Info) (any, error) {
	token := utils.SecureUniqueString()
	user := models.User{Id: utils.SecureUniqueId(app.AppId), Type: "human", Username: input.Username + "@" + app.AppId, Secret: input.Secret, Name: input.Name, Avatar: input.Avatar}
	app.Managers.DatabaseManager().Db.Create(&user)
	session := models.Session{Id: utils.SecureUniqueId(app.AppId), Token: token, UserId: user.Id}
	app.Managers.DatabaseManager().Db.Create(&session)
	app.Managers.MemoryManager().Put("auth::"+session.Token, fmt.Sprintf("human/%s", user.Id))
	return outputs_users.CreateOutput{User: user, Session: session}, nil
}

func update(app *runtime.App, input inputs_users.UpdateInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	app.Managers.DatabaseManager().Db.First(&user)
	user.Name = input.Name
	user.Avatar = input.Avatar
	user.Username = input.Username
	app.Managers.DatabaseManager().Db.Save(&user)
	return outputs_users.UpdateOutput{
		User: models.PublicUser{Id: user.Id, Type: user.Type, Username: user.Username, Name: user.Name, Avatar: user.Avatar},
	}, nil
}

func get(app *runtime.App, input inputs_users.GetInput, info models.Info) (any, error) {
	user := models.User{Id: input.UserId}
	err := app.Managers.DatabaseManager().Db.First(&user).Error
	return outputs_users.GetOutput{User: user}, err
}

func delete(app *runtime.App, input inputs_users.DeleteInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	err := app.Managers.DatabaseManager().Db.First(&user).Error
	if err != nil {
		return nil, err
	}
	sessions := []models.Session{}
	app.Managers.DatabaseManager().Db.Where("user_id = ?", user.Id).Find(&sessions)
	for _, session := range sessions {
		app.Managers.MemoryManager().Del("auth::" + session.Token)
		app.Managers.DatabaseManager().Db.Delete(&session)
	}
	app.Managers.DatabaseManager().Db.Delete(&user)
	return outputs_users.DeleteOutput{User: user}, nil
}

func CreateUserService(app *runtime.App, openToNet bool) {

	app.Managers.DatabaseManager().Db.AutoMigrate(&models.Session{})
	app.Managers.DatabaseManager().Db.AutoMigrate(&models.User{})

	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/authenticate",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(true, true, false, false, fiber.MethodPost),
		true,
		authenticate,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/create",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		create,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/update",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPut),
		true,
		update,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/delete",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodDelete),
		true,
		delete,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/get",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodGet),
		true,
		get,
	))
}

func LoadHumanGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedHumanServiceServer
	// }
	// pb.RegisterHumanServiceServer(grpcServer, &server{})
}
