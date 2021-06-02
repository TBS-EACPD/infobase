FROM eaadtbs/ib-ci-build:2.0

USER root

# for test-cafe
RUN apk add --no-cache \
  udev \
  xvfb \
  chromium

# mongodb not not available in alpine apk repositories post 3.9, switch back to old repo and install from there
# TODO check if this is still necessary in the future 
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/main' >> /etc/apk/repositories && \
  echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/community' >> /etc/apk/repositories && \
  apk update && \
  apk add mongodb yaml-cpp=0.6.2-r2

# create default mongodb data directory and give the $SERVICE_USER access
RUN mkdir -p /data/db && chown -R ${SERVICE_USER} /data/db

USER ${SERVICE_USER}
