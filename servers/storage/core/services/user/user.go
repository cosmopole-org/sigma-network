package services_user

import (
	"fmt"
	inputs_users "sigma/storage/core/inputs/users"
	"sigma/storage/core/tools"
	"sigma/storage/core/models"
	outputs_users "sigma/storage/core/outputs/users"
	"sigma/storage/core/runtime"
	"sigma/storage/core/utils"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

type UserService struct {
	tools tools.ICoreTools
}

func (s *UserService) authenticate(control *runtime.Control, input inputs_users.AuthenticateInput, info models.Info) (any, error) {
	_, res, _ := control.Services.CallActionInternally("/users/get", control, inputs_users.GetInput{UserId: info.User.Id}, runtime.Meta{UserId: "", SpaceId: "", TopicId: ""})
	return outputs_users.AuthenticateOutput{Authenticated: true, User: res.(outputs_users.GetOutput).User}, nil
}

func (s *UserService) create(control *runtime.Control, input inputs_users.CreateInput, info models.Info) (any, error) {
	token := utils.SecureUniqueString()
	user := models.User{Id: utils.SecureUniqueId(control.AppId), Type: "human", Username: input.Username + "@" + control.AppId, Secret: input.Secret, Name: input.Name, Avatar: input.Avatar}
	control.Trx.Create(&user)
	session := models.Session{Id: utils.SecureUniqueId(control.AppId), Token: token, UserId: user.Id}
	control.Trx.Create(&session)
	s.tools.Cache().Put("auth::"+session.Token, fmt.Sprintf("human/%s", user.Id))
	return outputs_users.CreateOutput{User: user, Session: session}, nil
}

func (s *UserService) update(control *runtime.Control, input inputs_users.UpdateInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	control.Trx.First(&user)
	user.Name = input.Name
	user.Avatar = input.Avatar
	user.Username = input.Username + "@" + control.AppId
	control.Trx.Save(&user)
	return outputs_users.UpdateOutput{
		User: models.PublicUser{Id: user.Id, Type: user.Type, Username: user.Username, Name: user.Name, Avatar: user.Avatar},
	}, nil
}

func (s *UserService) get(control *runtime.Control, input inputs_users.GetInput, info models.Info) (any, error) {
	user := models.User{Id: input.UserId}
	err := control.Trx.First(&user).Error()
	return outputs_users.GetOutput{User: user}, err
}

func (s *UserService) delete(control *runtime.Control, input inputs_users.DeleteInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	err := control.Trx.First(&user).Error()
	if err != nil {
		return nil, err
	}
	sessions := []models.Session{}
	control.Trx.Where("user_id = ?", user.Id).Find(&sessions)
	for _, session := range sessions {
		s.tools.Cache().Del("auth::" + session.Token)
		control.Trx.Delete(&session)
	}
	control.Trx.Delete(&user)
	return outputs_users.DeleteOutput{User: user}, nil
}

func CreateUserService(app *runtime.App) {

	service := &UserService{tools: app.Tools}

	app.Tools.Storage().AutoMigrate(&models.Session{})
	app.Tools.Storage().AutoMigrate(&models.User{})

	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/authenticate",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(true, true, false, false, fiber.MethodPost),
		true,
		service.authenticate,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/create",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPost),
		true,
		service.create,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/update",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPut),
		true,
		service.update,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/delete",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodDelete),
		true,
		service.delete,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/users/get",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodGet),
		true,
		service.get,
	))
}

func LoadHumanGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedHumanServiceServer
	// }
	// pb.RegisterHumanServiceServer(grpcServer, &server{})
}
