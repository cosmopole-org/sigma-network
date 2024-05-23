package updates_towers

import (
	pb "sigma/admin/core/models/grpc"
)

type Delete struct {
	Tower *pb.Tower `json:"tower"`
}
