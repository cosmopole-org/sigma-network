package updates_towers

import (
	pb "sigma/admin/shell/grpc"
)

type Update struct {
	Tower *pb.Tower `json:"tower"`
}
