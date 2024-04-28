package updates_towers

import (
	pb "sigma/main/core/grpc"
)

type Delete struct {
	Tower *pb.Tower `json:"tower"`
}
