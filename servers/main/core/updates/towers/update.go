package updates_towers

import (
	pb "sigma/main/core/grpc"
)

type Update struct {
	Tower *pb.Tower `json:"tower"`
}
