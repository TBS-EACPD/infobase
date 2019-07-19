#!/bin/sh
chmod 555 $PWD/dev_scripts/hooks/*
ln -sf $PWD/dev_scripts/hooks/* .git/hooks