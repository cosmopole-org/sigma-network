package updates_towers

import (
	pb "sigma/core/src/grpc"
)

type Join struct {
	Member *pb.Member `json:"member"`
}
