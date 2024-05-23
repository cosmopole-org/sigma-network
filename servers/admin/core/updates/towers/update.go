package updates_towers

import (
	pb "sigma/admin/core/models/grpc"
)

type Update struct {
	Tower *pb.Tower `json:"tower"`
}
