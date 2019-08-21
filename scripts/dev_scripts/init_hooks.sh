#!/bin/sh
chmod 555 $PWD/scripts/dev_scripts/hooks/*
ln -sf $PWD/scripts/dev_scripts/hooks/* .git/hooks