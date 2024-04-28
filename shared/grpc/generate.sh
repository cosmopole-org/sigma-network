#!/bin/bash

export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

protoc --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    packets.proto

cp packets.proto ../../servers/admin/core/grpc/packets.proto
cp packets_grpc.pb.go ../../servers/admin/core/grpc/packets_grpc.pb.go
cp packets.pb.go ../../servers/admin/core/grpc/packets.pb.go

cp packets.proto ../../servers/main/core/grpc/packets.proto
cp packets_grpc.pb.go ../../servers/main/core/grpc/packets_grpc.pb.go
cp packets.pb.go ../../servers/main/core/grpc/packets.pb.go
