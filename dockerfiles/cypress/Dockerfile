FROM cypress/base:14.16.0

ENV SERVICE_USER service-user
ENV SERVICE_HOME /home/${SERVICE_USER}

RUN adduser --home ${SERVICE_HOME} --shell /sbin/nologin -u 1001 ${SERVICE_USER}

USER root

RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
RUN echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
RUN apt-get update && apt-get install -y mongodb-org

# create default mongodb data directory and give the $SERVICE_USER access
RUN mkdir -p /data/db && chown -R ${SERVICE_USER} /data/db

USER ${SERVICE_USER}