package net_grpc

import (
	"context"
	"errors"
	"fmt"
	"net"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	moduleactormodel "sigma/sigma/layer1/module/actor"
	"strconv"
	"strings"

	"github.com/mitchellh/mapstructure"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"

	"google.golang.org/grpc/status"
)

type GrpcServer struct {
	sigmaCore abstract.ICore
	Server    *grpc.Server
	logger    *modulelogger.Logger
}

func ParseInput[T abstract.IInput](i interface{}) (abstract.IInput, error) {
	body := new(T)
	err := mapstructure.Decode(i, body)
	if err != nil {
		return nil, errors.New("invalid input format")
	}
	return *body, nil
}

func (gs *GrpcServer) serverInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	_ grpc.UnaryHandler,
) (interface{}, error) {
	fullMethod := info.FullMethod
	keyArr := strings.Split(fullMethod, "/")
	if len(keyArr) != 3 {
		return nil, status.Errorf(codes.InvalidArgument, "Wrong path format")
	}
	fmArr := strings.Split(keyArr[1], ".")
	if len(fmArr) != 2 {
		return nil, status.Errorf(codes.InvalidArgument, "Wrong path format")
	}
	key := "/" + strings.ToLower(fmArr[1][0:len(fmArr[1])-len("Service")]) + "s" + "/" + keyArr[2]
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "Metadata not provided")
	}
	tokenHeader, ok := md["token"]
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "Authorization token is not supplied")
	}
	token := tokenHeader[0]
	originHeader, ok := md["origin"]
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "Origin is not supplied")
	}
	origin := originHeader[0]
	reqIdHeader, ok := md["requestId"]
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "RequestId is not supplied")
	}
	requestId := reqIdHeader[0]
	layerHeader, ok := md["layer"]
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "layer is not supplied")
	}
	layerNumStr := layerHeader[0]
	layerNum, err := strconv.Atoi(layerNumStr)
	if err != nil {
		gs.logger.Println(err)
	}
	layer := gs.sigmaCore.Get(layerNum)
	action := layer.Actor().FetchAction(key)
	if action == nil {
		return nil, status.Errorf(codes.NotFound, "action not found")
	}
	input, err := action.(*moduleactormodel.SecureAction).ParseInput("grpc", req)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, err.Error())
	}
	res, _, err := action.(*moduleactormodel.SecureAction).SecurelyAct(layer, token, origin, requestId, input, "")
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, err.Error())
	} else {
		return res, nil
	}
}

func (gs *GrpcServer) Listen(port int) {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		gs.logger.Println("failed to listen grpc: %v", err)
	}
	gs.logger.Println("server listening at %v", lis.Addr())
	go func() {
		err := gs.Server.Serve(lis)
		if err != nil {
			gs.logger.Println(err)
		}
	}()
}

func New(core abstract.ICore, logger *modulelogger.Logger) *GrpcServer {
	gs := &GrpcServer{sigmaCore: core, logger: logger}
	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(gs.serverInterceptor),
	)
	gs.Server = grpcServer
	return gs
}
