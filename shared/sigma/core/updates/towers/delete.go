package updates_towers

import (
	pb "sigma/main/core/models/grpc"
)

type Delete struct {
	Tower *pb.Tower `json:"tower"`
}
