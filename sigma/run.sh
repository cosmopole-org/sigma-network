#!/bin/bash

export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

rm -r ./sigverse/pluggers
rm -r ./sigverse/main
go run ./build/pluggergen.go "./sigverse"
go run .
