package abstract

type IInfo interface {
	IsGod() bool
	UserId() string
	SpaceId() string
	TopicId() string
	Identity() (string, string)
}
