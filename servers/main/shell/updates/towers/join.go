package updates_towers

import (
	pb "sigma/main/shell/grpc"
)

type Join struct {
	Member *pb.Member `json:"member"`
}
