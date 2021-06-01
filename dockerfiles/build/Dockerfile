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

USER ${SERVICE_USER}

RUN curl -sSL https://sdk.cloud.google.com | bash && \
  exec sh && \
  gcloud init
ENV PATH $SERVICE_HOME/google-cloud-sdk/bin:$PATH

VOLUME  ${SERVICE_HOME}
