package updates_towers

import (
	pb "sigma/main/shell/grpc"
)

type Delete struct {
	Tower *pb.Tower `json:"tower"`
}
