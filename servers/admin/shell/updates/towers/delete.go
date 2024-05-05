package updates_towers

import (
	pb "sigma/admin/shell/grpc"
)

type Delete struct {
	Tower *pb.Tower `json:"tower"`
}
