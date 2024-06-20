#!/bin/bash

export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

protoc --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    packets.proto

mkdir -p ../../servers/admin/core/models/grpc
cp packets.proto ../../servers/admin/core/models/grpc/packets.proto
cp packets_grpc.pb.go ../../servers/admin/core/models/grpc/packets_grpc.pb.go
cp packets.pb.go ../../servers/admin/core/models/grpc/packets.pb.go

mkdir -p ../../servers/main/core/models/grpc
cp packets.proto ../../servers/main/core/models/grpc/packets.proto
cp packets_grpc.pb.go ../../servers/main/core/models/grpc/packets_grpc.pb.go
cp packets.pb.go ../../servers/main/core/models/grpc/packets.pb.go

mkdir -p ../../servers/storage/core/models/grpc
cp packets.proto ../../servers/storage/core/models/grpc/packets.proto
cp packets_grpc.pb.go ../../servers/storage/core/models/grpc/packets_grpc.pb.go
cp packets.pb.go ../../servers/storage/core/models/grpc/packets.pb.go

mkdir -p ../../tests/grpc/packets
cp packets.proto ../../tests/grpc/packets/packets.proto
cp packets_grpc.pb.go ../../tests/grpc/packets/packets_grpc.pb.go
cp packets.pb.go ../../tests/grpc/packets/packets.pb.go