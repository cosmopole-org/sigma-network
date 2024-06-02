package services_user

import (
	"fmt"
	inputs_users "sigma/storage/core/inputs/users"
	"sigma/storage/core/models"
	outputs_users "sigma/storage/core/outputs/users"
	"sigma/storage/core/runtime"
	"sigma/storage/core/utils"

	"google.golang.org/grpc"
)

type UserService struct {
	App *runtime.App
}

// Authenticate /users/authenticate check [ true false false ] access [ true false false false POST ]
func (s *UserService) Authenticate(control *runtime.Control, input inputs_users.AuthenticateInput, info models.Info) (any, error) {
	_, res, _ := control.Services.CallActionInternally("/users/get", control, inputs_users.GetInput{UserId: info.User.Id}, runtime.Meta{UserId: "", SpaceId: "", TopicId: ""})
	return outputs_users.AuthenticateOutput{Authenticated: true, User: res.(outputs_users.GetOutput).User}, nil
}

// Create /users/create check [ false false false ] access [ true false false false POST ]
func (s *UserService) Create(control *runtime.Control, input inputs_users.CreateInput, info models.Info) (any, error) {
	token := utils.SecureUniqueString()
	user := models.User{Id: utils.SecureUniqueId(control.AppId), Type: "human", Username: input.Username + "@" + control.AppId, Secret: input.Secret, Name: input.Name, Avatar: input.Avatar}
	control.Trx.Create(&user)
	session := models.Session{Id: utils.SecureUniqueId(control.AppId), Token: token, UserId: user.Id}
	control.Trx.Create(&session)
	s.App.Adapters().Cache().Put("auth::"+session.Token, fmt.Sprintf("human/%s", user.Id))
	return outputs_users.CreateOutput{User: user, Session: session}, nil
}

// Update /users/update check [ true false false ] access [ true false false false PUT ]
func (s *UserService) Update(control *runtime.Control, input inputs_users.UpdateInput, info models.Info) (any, error) {
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

// Get /users/get check [ false false false ] access [ true false false false GET ]
func (s *UserService) Get(control *runtime.Control, input inputs_users.GetInput, info models.Info) (any, error) {
	user := models.User{Id: input.UserId}
	err := control.Trx.First(&user).Error()
	return outputs_users.GetOutput{User: user}, err
}

// Delete /users/delete check [ true false false ] access [ true false false false DELETE ]
func (s *UserService) Delete(control *runtime.Control, input inputs_users.DeleteInput, info models.Info) (any, error) {
	user := models.User{Id: info.User.Id}
	err := control.Trx.First(&user).Error()
	if err != nil {
		return nil, err
	}
	sessions := []models.Session{}
	control.Trx.Where("user_id = ?", user.Id).Find(&sessions)
	for _, session := range sessions {
		s.App.Adapters().Cache().Del("auth::" + session.Token)
		control.Trx.Delete(&session)
	}
	control.Trx.Delete(&user)
	return outputs_users.DeleteOutput{User: user}, nil
}

func CreateUserService(app *runtime.App) {

	app.Adapters().Storage().AutoMigrate(&models.Session{})
	app.Adapters().Storage().AutoMigrate(&models.User{})
}

func LoadHumanGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedHumanServiceServer
	// }
	// pb.RegisterHumanServiceServer(grpcServer, &server{})
}
