FROM eaadtbs/ib-ci-build:latest

USER root

# mongodb not available in alpine apk repositories post 3.9, switch back to old repo and install from there
# TODO check if this is still necessary in the future 
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/main' >> /etc/apk/repositories && \
  echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/community' >> /etc/apk/repositories && \
  apk update && \
  apk add mongodb yaml-cpp=0.6.2-r2

USER ${SERVICE_USER}