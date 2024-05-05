package updates_towers

import (
	pb "sigma/admin/shell/grpc"
)

type Join struct {
	Member *pb.Member `json:"member"`
}
