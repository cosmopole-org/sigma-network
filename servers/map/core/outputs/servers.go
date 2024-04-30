package outputs

import pb "sigma/map/core/grpc"

type Servers struct {
	Map map[string]pb.Server `json:"map"`
}
