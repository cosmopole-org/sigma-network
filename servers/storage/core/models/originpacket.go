package models

type OriginPacket struct {
	Key        string
	UserId     string
	SpaceId    string
	TopicId    string
	RequestId  string
	Data       string
	IsResponse bool
	Exceptions []Client
}
