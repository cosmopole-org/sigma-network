// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.6.1
// source: pixelprof.proto

package pixelprof_grpc

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// DaServiceClient is the client API for DaService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type DaServiceClient interface {
	Update(ctx context.Context, in *DaUpdateRequest, opts ...grpc.CallOption) (*DaUpdateReply, error)
	Report(ctx context.Context, in *DaReportRequest, opts ...grpc.CallOption) (*DaReportReply, error)
	Read(ctx context.Context, in *DaReadRequest, opts ...grpc.CallOption) (*DaReadReply, error)
}

type daServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewDaServiceClient(cc grpc.ClientConnInterface) DaServiceClient {
	return &daServiceClient{cc}
}

func (c *daServiceClient) Update(ctx context.Context, in *DaUpdateRequest, opts ...grpc.CallOption) (*DaUpdateReply, error) {
	out := new(DaUpdateReply)
	err := c.cc.Invoke(ctx, "/pixelprof.DaService/update", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *daServiceClient) Report(ctx context.Context, in *DaReportRequest, opts ...grpc.CallOption) (*DaReportReply, error) {
	out := new(DaReportReply)
	err := c.cc.Invoke(ctx, "/pixelprof.DaService/report", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *daServiceClient) Read(ctx context.Context, in *DaReadRequest, opts ...grpc.CallOption) (*DaReadReply, error) {
	out := new(DaReadReply)
	err := c.cc.Invoke(ctx, "/pixelprof.DaService/read", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// DaServiceServer is the server API for DaService service.
// All implementations must embed UnimplementedDaServiceServer
// for forward compatibility
type DaServiceServer interface {
	Update(context.Context, *DaUpdateRequest) (*DaUpdateReply, error)
	Report(context.Context, *DaReportRequest) (*DaReportReply, error)
	Read(context.Context, *DaReadRequest) (*DaReadReply, error)
	mustEmbedUnimplementedDaServiceServer()
}

// UnimplementedDaServiceServer must be embedded to have forward compatible implementations.
type UnimplementedDaServiceServer struct {
}

func (UnimplementedDaServiceServer) Update(context.Context, *DaUpdateRequest) (*DaUpdateReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Update not implemented")
}
func (UnimplementedDaServiceServer) Report(context.Context, *DaReportRequest) (*DaReportReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Report not implemented")
}
func (UnimplementedDaServiceServer) Read(context.Context, *DaReadRequest) (*DaReadReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Read not implemented")
}
func (UnimplementedDaServiceServer) mustEmbedUnimplementedDaServiceServer() {}

// UnsafeDaServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to DaServiceServer will
// result in compilation errors.
type UnsafeDaServiceServer interface {
	mustEmbedUnimplementedDaServiceServer()
}

func RegisterDaServiceServer(s grpc.ServiceRegistrar, srv DaServiceServer) {
	s.RegisterService(&DaService_ServiceDesc, srv)
}

func _DaService_Update_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DaUpdateRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DaServiceServer).Update(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/pixelprof.DaService/update",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DaServiceServer).Update(ctx, req.(*DaUpdateRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _DaService_Report_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DaReportRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DaServiceServer).Report(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/pixelprof.DaService/report",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DaServiceServer).Report(ctx, req.(*DaReportRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _DaService_Read_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DaReadRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DaServiceServer).Read(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/pixelprof.DaService/read",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DaServiceServer).Read(ctx, req.(*DaReadRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// DaService_ServiceDesc is the grpc.ServiceDesc for DaService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var DaService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "pixelprof.DaService",
	HandlerType: (*DaServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "update",
			Handler:    _DaService_Update_Handler,
		},
		{
			MethodName: "report",
			Handler:    _DaService_Report_Handler,
		},
		{
			MethodName: "read",
			Handler:    _DaService_Read_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "pixelprof.proto",
}

// DiServiceClient is the client API for DiService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type DiServiceClient interface {
	Create(ctx context.Context, in *DiCreateRequest, opts ...grpc.CallOption) (*DiCreateReply, error)
	Update(ctx context.Context, in *DiUpdateRequest, opts ...grpc.CallOption) (*DiUpdateReply, error)
	Find(ctx context.Context, in *DiFindRequest, opts ...grpc.CallOption) (*DiFindReply, error)
	Read(ctx context.Context, in *DiReadRequest, opts ...grpc.CallOption) (*DiReadReply, error)
}

type diServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewDiServiceClient(cc grpc.ClientConnInterface) DiServiceClient {
	return &diServiceClient{cc}
}

func (c *diServiceClient) Create(ctx context.Context, in *DiCreateRequest, opts ...grpc.CallOption) (*DiCreateReply, error) {
	out := new(DiCreateReply)
	err := c.cc.Invoke(ctx, "/pixelprof.DiService/create", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *diServiceClient) Update(ctx context.Context, in *DiUpdateRequest, opts ...grpc.CallOption) (*DiUpdateReply, error) {
	out := new(DiUpdateReply)
	err := c.cc.Invoke(ctx, "/pixelprof.DiService/update", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *diServiceClient) Find(ctx context.Context, in *DiFindRequest, opts ...grpc.CallOption) (*DiFindReply, error) {
	out := new(DiFindReply)
	err := c.cc.Invoke(ctx, "/pixelprof.DiService/find", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *diServiceClient) Read(ctx context.Context, in *DiReadRequest, opts ...grpc.CallOption) (*DiReadReply, error) {
	out := new(DiReadReply)
	err := c.cc.Invoke(ctx, "/pixelprof.DiService/read", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// DiServiceServer is the server API for DiService service.
// All implementations must embed UnimplementedDiServiceServer
// for forward compatibility
type DiServiceServer interface {
	Create(context.Context, *DiCreateRequest) (*DiCreateReply, error)
	Update(context.Context, *DiUpdateRequest) (*DiUpdateReply, error)
	Find(context.Context, *DiFindRequest) (*DiFindReply, error)
	Read(context.Context, *DiReadRequest) (*DiReadReply, error)
	mustEmbedUnimplementedDiServiceServer()
}

// UnimplementedDiServiceServer must be embedded to have forward compatible implementations.
type UnimplementedDiServiceServer struct {
}

func (UnimplementedDiServiceServer) Create(context.Context, *DiCreateRequest) (*DiCreateReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Create not implemented")
}
func (UnimplementedDiServiceServer) Update(context.Context, *DiUpdateRequest) (*DiUpdateReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Update not implemented")
}
func (UnimplementedDiServiceServer) Find(context.Context, *DiFindRequest) (*DiFindReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Find not implemented")
}
func (UnimplementedDiServiceServer) Read(context.Context, *DiReadRequest) (*DiReadReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Read not implemented")
}
func (UnimplementedDiServiceServer) mustEmbedUnimplementedDiServiceServer() {}

// UnsafeDiServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to DiServiceServer will
// result in compilation errors.
type UnsafeDiServiceServer interface {
	mustEmbedUnimplementedDiServiceServer()
}

func RegisterDiServiceServer(s grpc.ServiceRegistrar, srv DiServiceServer) {
	s.RegisterService(&DiService_ServiceDesc, srv)
}

func _DiService_Create_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DiCreateRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DiServiceServer).Create(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/pixelprof.DiService/create",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DiServiceServer).Create(ctx, req.(*DiCreateRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _DiService_Update_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DiUpdateRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DiServiceServer).Update(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/pixelprof.DiService/update",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DiServiceServer).Update(ctx, req.(*DiUpdateRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _DiService_Find_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DiFindRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DiServiceServer).Find(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/pixelprof.DiService/find",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DiServiceServer).Find(ctx, req.(*DiFindRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _DiService_Read_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DiReadRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DiServiceServer).Read(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/pixelprof.DiService/read",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DiServiceServer).Read(ctx, req.(*DiReadRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// DiService_ServiceDesc is the grpc.ServiceDesc for DiService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var DiService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "pixelprof.DiService",
	HandlerType: (*DiServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "create",
			Handler:    _DiService_Create_Handler,
		},
		{
			MethodName: "update",
			Handler:    _DiService_Update_Handler,
		},
		{
			MethodName: "find",
			Handler:    _DiService_Find_Handler,
		},
		{
			MethodName: "read",
			Handler:    _DiService_Read_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "pixelprof.proto",
}
