package interfed

import "fmt"

func HandleInterfedPacket(channelId string, payload string) {
	fmt.Println("federation message from:", channelId, "payload:", payload)
	// if payload.Key == "towers/join" {
	// 	fmt.Println("joining tower...")
	// }
}
