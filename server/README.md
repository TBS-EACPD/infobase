*(le Français suit)*

InfoBase API
========

[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBase.svg?style=svg&circle-token=a99b6b8309e5edd904b0386c4a92c10bf5f43e29)](https://circleci.com/gh/TBS-EACPD/InfoBase)

GraphQL API for InfoBase data.

## Table of Contents
- [InfoBase API](#InfoBase-API)
  - [Table of Contents](#Table-of-Contents)
  - [Getting started](#Getting-started)
    - [Running the API server locally](#Running-the-API-server-locally)
  - [Tests](#Tests)
    - [Snapshot tests](#Snapshot-tests)
  - [File structure](#File-structure)
    - [models/](#models)
  - [Cloud stuff](#Cloud-stuff)
    - [Mongodb Atlas](#Mongodb-Atlas)
    - [Google Cloud Function](#Google-Cloud-Function)


## Getting started

### Running the API server locally
0. Install node ^9.0.0, npm ^5.7.1, and mongo
1. run `mongod` in the background/a spare shell
2. open a shell in `/server`
3. `npm ci` to load the required node_modules
4. `npm run populate_db` to populate a local mongo database (named `infobase`). Can be left running to watch for changes in `../data`
5. `npm start` to start the express/GraphQL server listening on `localhost:1337`. Watches for changes in `src`
6. Optional: visit `http://localhost:1337` for a GraphiQL instance, test some queries

## Tests

### Snapshot tests
Not great, but better than nothing. These tests largely run preconfigured GraphQL queries against the local GraphQL server and ensure that the reponse matches a response snapshot committed in to the repo along side the relevant model. Note that these snapshots use a separate set of testing data found in `../test-data`, meaning that snapshots aren't made stale by generic data updates. On the other hand, the test data must be updated periodically to ensure it contains all important edge cases, after which the testing snapshots need to be reproduced (and sampled to manually confirm correctness, when they're first produced).

Snapshot tests can be run by following the steps in "Running the API server locally" followed by running `npm test`.


## File structure

### models/
* models are organized by area in `src/models/`
* each `src/models/<model_name>/` will contain 
  1. The model definitions (`models.js`)
  2. Code to populate the models, usually fetching csv strings from `../data/` (`populate.js`)
  3. Schema definitions, both the schema string and the resolvers (`schema.js`)
    * This is the most complicated part, schema strings can use the `extend` keyword to add fields to other types
    * resolvers are merged deeply together so no need for special extend keywords


## Cloud stuff

### Mongodb Atlas
In production, we use a MongoDB Atlas hosted database. This has little relevance to the source code, outside of `src/db_utils.js`.

### Google Cloud Function
The production environment for the express/GraphQL server is a Google Cloud Function. Again, this hasn't had much of a lock-in effect on the source code, although a few optimizations and decisions were made with a serverless environment in mind. We currently transpile with a traget of Node 6 because that is what GCFs run (TODO: update to Node 8 GCFs).


L'interface de programmation d'applications (API) de l'InfoBase
========

[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBase.svg?style=svg&circle-token=a99b6b8309e5edd904b0386c4a92c10bf5f43e29)](https://circleci.com/gh/TBS-EACPD/InfoBase)

Une interface de programmation d'applications GraphQL pour les données.

## Table des matières
- [l'interface de programmation d'applications (API) de l'InfoBase](#L'interface-de-programmation-d'applications-(API)-de l'InfoBase)
  - [Table des matières](#Table-des-matières)
  - [Commencer](#Commencer)
    - [Lancer le serveur de l'API](#Lancer-le-serveur-de-l'API)
  - [Tests](#Tests)
    - [Tests «Snapshot»](#Tests-Snapshot)
  - [Structure des fichiers](#Structure-des-fichiers)
    - [fichier models/](#fichier-models)
  - [Outils infonuagiques](#Outils-infonuagiques)
    - [Mongodb Atlas](#Mongodb-Atlas)
    - [Fonction Google Cloud](#Fonction-Google-Cloud)
