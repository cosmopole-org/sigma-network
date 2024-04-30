package types

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
}
