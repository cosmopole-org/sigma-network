package updates_towers

import (
	pb "sigma/core/src/grpc"
)

type Delete struct {
	Tower *pb.Tower `json:"tower"`
}