FROM mhart/alpine-node:latest

ENV SERVICE_USER build-image-user
ENV SERVICE_HOME /home/${SERVICE_USER}

# commom
RUN adduser -h ${SERVICE_HOME} -s /sbin/nologin -u 1000 -D ${SERVICE_USER} && \
  apk update && apk upgrade && \
  apk add --no-cache \
    git \
    bash \
    ca-certificates
# image specific
RUN apk add --no-cache \
  openssh \
  curl

USER    ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
VOLUME  ${SERVICE_HOME}