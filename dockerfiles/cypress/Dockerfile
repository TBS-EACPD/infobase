FROM cypress/base:20.18.0

ENV SERVICE_USER service-user
ENV SERVICE_HOME /home/${SERVICE_USER}

RUN adduser --home ${SERVICE_HOME} --shell /sbin/nologin -u 1001 ${SERVICE_USER}

USER root

# Install gnupg
RUN apt-get update && apt-get install -y gnupg

# Add MongoDB GPG key and repository for Bookworm
RUN wget -qO - https://www.mongodb.org/static/pgp/server-8.0.asc | apt-key add -
    RUN echo "deb http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list
    RUN apt-get update && apt-get install -y mongodb-org

USER ${SERVICE_USER}