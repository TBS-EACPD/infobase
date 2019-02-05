FROM node:9.9.0

# Create app directory
WORKDIR /usr/src/app
#350 is an id for the group
RUN groupadd -r -g 350 api && \
    useradd -r -m -u 350 -g 350 api


# dependency installing steps below
# commented out because we could easily just include all the node_modules in the image... Is this bad practice?
ENV PROD true


# See .dockerignore to see what's actually copied
COPY . .

# Install app dependencies
RUN npm install

EXPOSE 1337
USER api
CMD [ "npm", "start" ]
