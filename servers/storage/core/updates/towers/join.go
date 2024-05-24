package updates_towers

import (
	pb "sigma/storage/core/models/grpc"
)

type Join struct {
	Member *pb.Member `json:"member"`
}
