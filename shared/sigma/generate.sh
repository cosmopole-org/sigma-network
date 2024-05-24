#!/bin/bash

export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

rm -r ../../servers/main/core
rm -r ../../servers/main/shell
rm -r ../../servers/main/go.mod
cp -r core ../../servers/main/core
cp -r shell ../../servers/main/shell
cp go.mod ../../servers/main/go.mod
cp go.sum ../../servers/main/go.sum

rm -r ../../servers/admin/core
rm -r ../../servers/admin/shell
rm -r ../../servers/admin/go.mod
cp -r core ../../servers/admin/core
cp -r shell ../../servers/admin/shell
cp go.mod ../../servers/admin/go.mod
cp go.sum ../../servers/admin/go.sum
find ../../servers/admin/core -type f -exec sed -i 's/main/admin/g' {} \;
find ../../servers/admin/shell -type f -exec sed -i 's/main/admin/g' {} \;
sed -i 's/main/admin/' ../../servers/admin/go.mod

rm -r ../../servers/storage/core
rm -r ../../servers/storage/shell
rm -r ../../servers/storage/go.mod
cp -r core ../../servers/storage/core
cp -r shell ../../servers/storage/shell
cp go.mod ../../servers/storage/go.mod
cp go.sum ../../servers/storage/go.sum
find ../../servers/storage/core -type f -exec sed -i 's/main/storage/g' {} \;
find ../../servers/storage/shell -type f -exec sed -i 's/main/storage/g' {} \;
sed -i 's/main/storage/' ../../servers/storage/go.mod