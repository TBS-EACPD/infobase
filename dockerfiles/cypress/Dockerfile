FROM cypress/base:14.16.0

ENV SERVICE_USER service-user
ENV SERVICE_HOME /home/${SERVICE_USER}

RUN adduser --home ${SERVICE_HOME} --shell /sbin/nologin -u 1001 ${SERVICE_USER}

USER root

RUN wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
RUN echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/5.0 main" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
RUN apt-get update && apt-get install -y mongodb-org

USER ${SERVICE_USER}