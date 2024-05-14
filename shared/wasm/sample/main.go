package main

import (
	"encoding/json"
	"strings"
	"unsafe"
)

func main() {}

//export hello
func hello(subject *int32) *int32 {
	nth := 0
	var subjectStr strings.Builder
	pointer := uintptr(unsafe.Pointer(subject))
	for {
		s := *(*int32)(unsafe.Pointer(pointer + uintptr(nth)))
		if s == 0 {
			break
		}

		subjectStr.WriteByte(byte(s))
		nth++
	}

	var output = ""

	input := subjectStr.String()

	var data map[string]interface{}
	err := json.Unmarshal([]byte(input), &data)
	if err != nil {
		output = err.Error()
	} else {
		var name, ok = data["name"]
		if ok {
			output = "hello " + name.(string)
		} else {
			output = "hello [empty]"
		}
	}

	var outp = []byte(output)

	r := make([]int32, 2)
	r[0] = int32(uintptr(unsafe.Pointer(&(outp[0]))))
	r[1] = int32(len(output))

	return &r[0]
}
