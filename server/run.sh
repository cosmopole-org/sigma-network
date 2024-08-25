#!/bin/bash

export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

rm -r ./sigverse/pluggers
rm -r ./sigverse/main
rm -r ./pluginer/pluggers
rm -r ./pluginer/main
rm -r ./social/pluggers
rm -r ./social/main
rm -r ./admin/pluggers
rm -r ./admin/main
go run ./build/pluggergen.go "./sigverse" "./pluginer" "./social" "./admin"
go run .
