package updates_towers

import (
	pb "sigma/main/shell/grpc"
)

type Update struct {
	Tower *pb.Tower `json:"tower"`
}
