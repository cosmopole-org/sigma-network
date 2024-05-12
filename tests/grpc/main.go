package main

import (
	"context"
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
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*60)
	defer cancel()
	md := metadata.New(map[string]string{
		"origin": "8081",
		"token":  "OwLK6S4KA8kuXduseAq3akHjHzjegxSW",
	})
	for i := 0; i < 1; i++ {
		ctxWithMetadata := metadata.NewOutgoingContext(ctx, md)
		r, err := c.Get(ctxWithMetadata, &pb.HumanGetDto{
			UserId: 3,
		})
		if err != nil {
			log.Fatalf("could not greet: %v", err)
		}
		log.Println(r)
		r2, err2 := c.Update(ctxWithMetadata, &pb.HumanUpdateDto{
			FirstName: "keyhan",
			LastName:  "mohammadi",
		})
		if err2 != nil {
			log.Fatalf("could not greet: %v", err2)
		}
		log.Println(r2)
	}
}
