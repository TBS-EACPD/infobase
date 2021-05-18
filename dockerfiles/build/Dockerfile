FROM mhart/alpine-node:14

ENV SERVICE_USER build-image-user
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
    procps
USER ${SERVICE_USER}
RUN curl -sSL https://sdk.cloud.google.com | bash && \
  exec sh && \
  gcloud init
ENV PATH $SERVICE_HOME/google-cloud-sdk/bin:$PATH
USER root

# image specific
RUN apk add --no-cache --virtual .gyp \
  make \
  openssh \
  g++ \
  && apk del .gyp

USER    ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
VOLUME  ${SERVICE_HOME}