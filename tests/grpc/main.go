package main

import (
	"context"
	"fmt"
	"log"
	"time"

	pb "sigma/test/packets"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

func main() {
	conn, err := grpc.Dial("localhost:8083", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	c := pb.NewHumanServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	md := metadata.New(map[string]string{
		"origin": "8082",
	})
    ctxWithMetadata := metadata.NewOutgoingContext(ctx, md)
	r, err := c.Get(ctxWithMetadata, &pb.HumanGetDto{
		UserId: 3,
	})
	if err != nil {
		log.Fatalf("could not greet: %v", err)
	}
	fmt.Println(r)
}
