FROM mhart/alpine-node:latest

ENV SERVICE_USER test-image-user
ENV SERVICE_HOME /home/${SERVICE_USER}

RUN adduser -h ${SERVICE_HOME} -s /sbin/nologin -u 1000 -D ${SERVICE_USER} && \
  apk update && apk upgrade && \
  apk add --no-cache \
    udev \
    xvfb \
    chromium \
    ca-certificates \ 
    mongodb \
    git \
    bash

RUN mkdir -p /data/db # create default mongodb data directory

USER    ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
VOLUME  ${SERVICE_HOME}