FROM mhart/alpine-node:14

ENV SERVICE_USER test-image-user
ENV SERVICE_HOME /home/${SERVICE_USER}

# common
RUN adduser -h ${SERVICE_HOME} -s /sbin/nologin -u 1000 -D ${SERVICE_USER}
RUN apk update && apk upgrade && \
  apk add --no-cache \
    git \
    bash \
    curl \
    ca-certificates \
    python \
    procps \
    openssh
USER ${SERVICE_USER}
RUN curl -sSL https://sdk.cloud.google.com | bash && \
  exec sh && \
  gcloud init
ENV PATH $SERVICE_HOME/google-cloud-sdk/bin:$PATH
USER root

# image specific
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

# create default mongodb data directory and give the $USER access
RUN mkdir -p /data/db && chown -R ${SERVICE_USER} /data/db

USER    ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
VOLUME  ${SERVICE_HOME}