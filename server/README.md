[![CircleCI](https://circleci.com/gh/TBS-EACPD/infobase.svg?style=shield)](https://circleci.com/gh/TBS-EACPD/infobase)
[![Test coverage status badge](https://storage.googleapis.com/all-test-coverage/master-server-coverage-badge.svg)](https://storage.googleapis.com/all-test-coverage/master-server-coverage.txt)

*(le Français suit)*

InfoBase API
========

GraphQL API for InfoBase data.

## Table of Contents
- [InfoBase API](#infobase-api)
  - [Table of Contents](#table-of-contents)
  - [Getting started](#getting-started)
    - [Running the API server locally](#running-the-api-server-locally)
  - [Tests](#tests)
    - [Snapshot tests](#snapshot-tests)
  - [File structure](#file-structure)
    - [models/](#models)
  - [Cloud stuff](#cloud-stuff)
    - [Mongodb Atlas](#mongodb-atlas)
    - [Google Cloud Function](#google-cloud-function)


## Getting started

### Running the API server locally
1. Install node ^9.0.0, npm ^5.7.1, and mongo
2. open a shell in `/server`
3. `npm run mongod`, either background this process or open another shell in `/server` for further steps
4. `npm ci` to load the required node_modules
5. `npm run populate_db` to populate a local mongo database (named `infobase`). Can be left running to watch for changes in `../data`
6. `npm start` to start the express/GraphQL server listening on `localhost:1337`. Watches for changes in `src`
7. Optional: visit `http://localhost:1337` for a GraphiQL instance, test some queries

## Tests

### Snapshot tests
Not great, but better than nothing. These tests largely run preconfigured GraphQL queries against the local GraphQL server and ensure that the reponse matches a response snapshot committed in to the repo along side the relevant model. Note that these snapshots use a separate set of testing data found in `../test-data`, meaning that snapshots aren't made stale by generic data updates. On the other hand, the test data must be updated periodically to ensure it contains all important edge cases, after which the testing snapshots need to be regenerated (and the test snapshots should be checked manually to confirm correctness).

Snapshot tests can be run by following the steps in "Running the API server locally" followed by running `npm test`.


## File structure

### models/
* models are organized by topic (e.g. finance) in `src/models/`
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
The production environment for the express/GraphQL server is a Google Cloud Function. This hasn't affected much in the code, although a few optimizations and decisions were made with a serverless environment in mind. We currently transpile with a traget of Node 8 because that is what GCFs run.

L'interface de programmation d'applications (API) d'InfoBase du GC
========

Une interface de programmation d'applications GraphQL pour les données d'InfoBase du GC.

## Table des matières
- [L'interface de programmation d'applications (API) d'InfoBase du GC](#linterface-de-programmation-dapplications-api-de-linfobase)
  - [Commencer](#commencer)
    - [Lancer le serveur de l'API](#lancer-le-serveur-de-lapi)
  - [Tests](#tests-1)
    - [Tests « Snapshot »](#tests-%c2%ab-snapshot-%c2%bb)
  - [Structure des fichiers](#structure-des-fichiers)
    - [fichier models/](#fichier-models)
  - [Outils infonuagiques](#outils-infonuagiques)
    - [Mongodb Atlas](#mongodb-atlas-1)
    - [Fonction Google Cloud](#fonction-google-cloud)
    
## Commencer

### Lancer le serveur de l'API

1. Installez node ^9.0.0, npm ^5.7.1, et mongo
2. Lancez `mongod` avec un commande d'exécution supplémentaire ou en arrière-plan
3. Lancez un commande d'exécution à le fichier `/server`
4. `npm ci` pour installer les node_modules nécessitées
5. `npm run populate_db` pour peupler une base de données mongo (au nom `infobase`). Peut être laissé regardant aux changements dans le fichier `../data`
6. `npm start` pour lancer le serveur express/GraphQL qui entend à `localhost:1337`. Ce processus détecte les changements au fichier `src`
7. Facultatif: visitez `http://localhost:1337`, où se trouve une instance GraphiQL, pour tester quelques requêtes

## Tests

### Tests « Snapshot »

Cette type de test n'est pas la meilleure, mais c'est plus que rien. Ces tests lancent des requêtes GraphQL préconfigurées sous le serveur local GraphQL et ils s'assurent que le réponse est identique à un réponse snapshot qui a été archivé dans le dépôt. Notez que ces snapshots utilisent un ensemble séparé de données de test qui se trouve à `../test-data`, donc les mises à jour de données n'invalident pas ces tests. Par contre, on doit mettre à jour les données de tests périodiquement pour s'assurer ils contiennent tous les cas de bord importants. Après, les snapshots doivent être régénérés (et on devrait vérifier les snapshots à main pour vérifier leur exactitude).

Vous pouvez lancer les test snapshot par suivre les étapes au-dessus et ensuite lancer `npm test`.

## Structure des fichiers

### fichier models/

* les modèles sont organisés par sujet dans le fichier `src/models/`
* chaque fichier `src/models/<nom de modèle>/` contient
  i. Les définitions des modèles (`models.js`)
  ii. Code qui se populent les modèles par aller chercher des chaînes en forme csv dans le fichier `../data/` (`populate.js`)
  iii. Les définitions du schéma (la chaînes du schéma et les résolveurs) (`schema.js`)
    * Ceci est la partie le plus compliqué. Les chaînes du schéma peut utiliser le mot-clé `extend` pour ajouter des champs aux autres types
    * Les résolveurs sont fusionnés de façon profond, on n'a pas besoin d'utiliser le mot-clé `extend`

## Outils infonuagiques

### Mongodb Atlas

Dans l'environnement de production, on utilise une base de données MongoDB Atlas. Ceci a peu de pertinence à l'exception de `src/db_utils.js`.

### Fonction Google Cloud

L'environnement de production pour le serveur express/GraphQL est une fonction Google Cloud. Celui n'affectait pas beaucoup dans le code, mais quelques optimisations ont été faites et décisions ont été prises avec une environnement sans serveur à l'esprit. 
