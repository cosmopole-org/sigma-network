#!/bin/bash

rm -r ./build
cp -r ./lib/runtime ./src/runtime
npm run webpack
mkdir ./lib/assets
cp ./dist/build.js ./lib/assets/build.js.txt
cd ./lib
npm run build
cd ..
rm -r ./src/runtime
mkdir ./build
cp -r ./lib/dist/. ./build
rm -r ./lib/dist
rm -r ./dist
