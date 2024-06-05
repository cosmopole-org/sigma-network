#!/bin/bash

export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

go run ./build/pluggergen.go "./sigverse"
