package models

type Worker struct {
	Id        int64  `json:"id"`
	MachineId int64  `json:"machineId"`
	RoomId    int64  `json:"roomId"`
	Metadata  string `json:"metadata"`
}
