#!/bin/sh

yarn bundle
mkdir release
cp -r bundles release/
cp -r assets release/
cp index.html release/
