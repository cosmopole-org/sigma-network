package inputs

type IInput interface {
	GetData() any
	GetSpaceId() string
	GetTopicId() string
	GetMemberId() string
}
