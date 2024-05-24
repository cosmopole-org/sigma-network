package dtos

type IDto interface {
	GetData() any
	GetTowerId() int64
	GetRoomId() int64
	GetWorkerId() int64
}
