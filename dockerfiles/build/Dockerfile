# by :13.0.1 at least, alpine-node started coming with old versions of chromium and mongodb installed
# No luck upgrading or uninstalling them, and they were breaking testcafe and cleanup_dev_dbs.sh respectively
# 12.9.0 was the previous image I built from/knew to be good, not necessarily the latest pre-funny buisness
# ... can't stay locked to this forever though
# The problem really only effected the container used for testing, but keeping build locked to the same version for consistency
FROM mhart/alpine-node:12.9.0 

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
    python
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
  && npm install \
  && apk del .gyp

USER    ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
VOLUME  ${SERVICE_HOME}