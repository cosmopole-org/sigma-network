#!/bin/bash

export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

go run ./build/build.go "core" "/home/keyhan/MyWorkspace/sigma/shared/sigma/core/services" "shell" "/home/keyhan/MyWorkspace/sigma/shared/sigma/shell/services"

rm -r ../../servers/main/core
rm -r ../../servers/main/shell
rm -r ../../servers/main/sigma
cp -r core ../../servers/main/core
cp -r shell ../../servers/main/shell
cp -r sigma ../../servers/main/sigma

rm -r ../../servers/admin/core
rm -r ../../servers/admin/shell
rm -r ../../servers/admin/sigma
cp -r core ../../servers/admin/core
cp -r shell ../../servers/admin/shell
cp -r sigma ../../servers/admin/sigma
find ../../servers/admin/core -type f -exec sed -i 's/main/admin/g' {} \;
find ../../servers/admin/shell -type f -exec sed -i 's/main/admin/g' {} \;
sed -i 's/main/admin/' ../../servers/admin/sigma/sigma.go

rm -r ../../servers/storage/core
rm -r ../../servers/storage/shell
rm -r ../../servers/storage/sigma
cp -r core ../../servers/storage/core
cp -r shell ../../servers/storage/shell
cp -r sigma ../../servers/storage/sigma
find ../../servers/storage/core -type f -exec sed -i 's/main/storage/g' {} \;
find ../../servers/storage/shell -type f -exec sed -i 's/main/storage/g' {} \;
sed -i 's/main/storage/' ../../servers/storage/sigma/sigma.go