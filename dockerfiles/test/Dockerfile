FROM mhart/alpine-node:latest
RUN apk update && apk upgrade && \
    apk add --no-cache \
    udev \
    xvfb \
    chromium \
    ca-certificates \ 
    mongodb
RUN mkdir -p /data/db # create default mongodb data directory
RUN apk add --no-cache bash