package updates_towers

import (
	pb "sigma/main/core/grpc"
)

type Join struct {
	Member *pb.Member `json:"member"`
}
