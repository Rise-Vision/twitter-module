#!/bin/bash

set -x
rm -rf build-temp
mkdir -p build-temp
cp package.json ./build-temp
cd ./build-temp
npm install --production
cd ..
rm -rf build
mkdir -p build
