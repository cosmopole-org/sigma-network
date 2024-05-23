package updates_towers

import (
	pb "sigma/admin/core/models/grpc"
)

type Join struct {
	Member *pb.Member `json:"member"`
}
