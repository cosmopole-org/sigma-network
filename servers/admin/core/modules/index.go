package modules

type OriginPacket struct {
	Key        string
	UserId     int64
	TowerId    int64
	RoomId     int64
	RequestId  string
	Data       string
	IsResponse bool
	GroupId    int64
	Exceptions []GroupMember
}

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
