package updates_towers

import (
	pb "sigma/main/core/models/grpc"
)

type Join struct {
	Member *pb.Member `json:"member"`
}
