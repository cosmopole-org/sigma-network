package updates_workers

import (
	pb "sigma/admin/core/models/grpc"
)

type Create struct {
	TowerId int64      `json:"towerId"`
	Worker  *pb.Worker `json:"worker"`
}
