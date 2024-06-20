package abstract

type IInfo interface {
	UserId() string
	SpaceId() string
	TopicId() string
	Identity() (string, string)
}
