FROM mhart/alpine-node:latest

ENV SERVICE_USER build-image-user
ENV SERVICE_HOME /home/${SERVICE_USER}

# common
RUN adduser -h ${SERVICE_HOME} -s /sbin/nologin -u 1000 -D ${SERVICE_USER} && \
  apk update && apk upgrade && \
  apk add --no-cache \
    git \
    bash \
    curl \
    ca-certificates && \
  curl -sSL https://sdk.cloud.google.com | bash && \
  curl https://storage.googleapis.com/pub/gsutil.tar.gz && tar xfz gsutil.tar.gz -C $HOME && rm gsutil.tar.gz
ENV PATH ${PATH}:$HOME/gsutil

# image specific
RUN apk add --no-cache \
  openssh

USER    ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
VOLUME  ${SERVICE_HOME}