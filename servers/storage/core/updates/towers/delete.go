package updates_towers

import (
	pb "sigma/storage/core/models/grpc"
)

type Delete struct {
	Tower *pb.Tower `json:"tower"`
}
