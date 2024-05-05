#!/bin/bash

export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

protoc --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    packets.proto

cp packets.proto ../../servers/admin/shell/grpc/packets.proto
cp packets_grpc.pb.go ../../servers/admin/shell/grpc/packets_grpc.pb.go
cp packets.pb.go ../../servers/admin/shell/grpc/packets.pb.go

cp packets.proto ../../servers/main/shell/grpc/packets.proto
cp packets_grpc.pb.go ../../servers/main/shell/grpc/packets_grpc.pb.go
cp packets.pb.go ../../servers/main/shell/grpc/packets.pb.go

cp packets.proto ../../tests/grpc/packets/packets.proto
cp packets_grpc.pb.go ../../tests/grpc/packets/packets_grpc.pb.go
cp packets.pb.go ../../tests/grpc/packets/packets.pb.go