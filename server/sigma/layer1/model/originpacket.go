package module_model

type OriginPacket struct {
	Key        string
	Layer      int
	UserId     string
	SpaceId    string
	TopicId    string
	RequestId  string
	Data       string
	IsResponse bool
	Exceptions []string
}
