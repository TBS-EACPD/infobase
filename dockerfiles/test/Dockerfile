# by :13.0.1 at least, alpine-node started including comming with old versions of chromium and mongodb installed
# No luck upgrading or uninstalling them, and they were breaking testcafe and cleanup_dev_dbs.sh respectively
# 12.9.0 was the previous image I built from/knew to be good, not necessarily the latest pre-funny buisness
# ... can't stay locked to this forever though
FROM mhart/alpine-node:12.9.0 

ENV SERVICE_USER test-image-user
ENV SERVICE_HOME /home/${SERVICE_USER}

# common
RUN adduser -h ${SERVICE_HOME} -s /sbin/nologin -u 1000 -D ${SERVICE_USER} && \
  apk update && apk upgrade && \
  apk add --no-cache \
    git \
    bash \
    ca-certificates \
    mongodb
# image specific
RUN apk add --no-cache \
  udev \
  xvfb \
  chromium

# create default mongodb data directory and give the $USER access
RUN mkdir -p /data/db && chown -R $SERVICE_USER /data/db

USER    ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
VOLUME  ${SERVICE_HOME}