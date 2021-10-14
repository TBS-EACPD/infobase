FROM mhart/alpine-node:14

ENV SERVICE_USER service-user
ENV SERVICE_HOME /home/${SERVICE_USER}

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

RUN npm install -g npm@8

USER ${SERVICE_USER}

VOLUME  ${SERVICE_HOME}