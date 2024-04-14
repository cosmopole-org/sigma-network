package updates_towers

import (
	pb "sigma/core/src/grpc"
)

type Update struct {
	Tower *pb.Tower `json:"tower"`
}
