package modules

type IPacket interface {
	GetData() any
}

type ListenOptions struct {
	Https     bool
	HttpsPort int
	Grpc      bool
	GrpcPort  int
}

type Meta struct {
	UserId  int64
	TowerId int64
	RoomId  int64
}

type IDto interface {
	GetData() any
	GetTowerId() int64
	GetRoomId() int64
	GetWorkerId() int64
}

type ResponseSimpleMessage struct {
	Message string `json:"message"`
}
