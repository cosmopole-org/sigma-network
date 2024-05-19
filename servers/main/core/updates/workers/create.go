package updates_workers

import (
	pb "sigma/main/core/models/grpc"
)

type Create struct {
	TowerId int64      `json:"towerId"`
	Worker  *pb.Worker `json:"worker"`
}
