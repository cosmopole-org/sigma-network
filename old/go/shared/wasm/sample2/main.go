package main

import "unsafe"

func main() {}

//export run
func run() *int32 {
	output := []byte("hello world !")
	r := make([]int32, 2)
	r[0] = int32(uintptr(unsafe.Pointer(&(output[0]))))
	r[1] = int32(len(output))
	return &r[0]
}
