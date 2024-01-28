package cosmopole_models

type Message struct {
	Id       int64  `json:"id"`
	AuthorId int64  `json:"authorId"`
	Time     int64  `json:"time"`
	SpaceId  int64  `json:"spaceId"`
	Data     string `json:"data"`
}
