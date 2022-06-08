[![CircleCI](https://circleci.com/gh/TBS-EACPD/infobase.svg?style=shield)](https://circleci.com/gh/TBS-EACPD/infobase)  
General: [![codecov](https://codecov.io/gh/tbs-eacpd/infobase/branch/master/graph/badge.svg?flag=client)](https://app.codecov.io/gh/TBS-EACPD/infobase/)  
Shallow E2E: [![codecov](https://codecov.io/gh/tbs-eacpd/infobase/branch/master/graph/badge.svg?flag=e2e_shallow)](https://app.codecov.io/gh/TBS-EACPD/infobase/)

_(le Français suit)_

# GC InfoBase

Client-side code and content for the GC InfoBase. / Code et contenu pour le côté client d'InfoBase du GC.

_(Le Français suit)_

## Table of Contents

- [GC InfoBase](#gc-infobase)
  - [Getting Started](#getting-started)
    - [First time setup](#first-time-setup)
    - [Building GC InfoBase](#building-the-infobase)
    - [Visiting a local build](#visiting-a-local-build)
  - [Tests](#tests)
    - [Browser tests](#browser-tests)
      - [Route load tests](#route-load-tests)

## Getting Started

### Development pre-requisites

- git
- npm@8.x
- node@16.x

### First time setup

1. Open a terminal and go to the directory where you want to store the project, e.g. `cd ~/Documents`
2. `git clone https://github.com/TBS-EACPD/InfoBase.git`
3. In the root directory `./InfoBase`, run `npm install && cd client && npm install && cd ../server && npm install && cd ../email_backend && npm install && cd ..`

### Running locally

0. Follow the steps in `InfoBase/server/README.md` to start a local backend
1. `cd` to the `InfoBase/client` dir
2. `npm ci`
3. `npm run build_static:watch` to gather and bundle static files (csv's, svg's, extended bootstrap css). Can be left running to watch for changes
4. `npm run gqlgen:watch` to generate .gql.ts files from .graphql files
5. `npm run webpack -- EN FR` to bundle the source code

### Visiting a local build

0. prerequisites: 1) follow the build steps above, 2) follow the steps up through spinning up a local GraphQL API server from the [server README](https://github.com/TBS-EACPD/InfoBase/blob/master/server/README.md)
1. Go to the client directory of your GC InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
2. `npm run serve` to start a server in GC InfoBase directory, localhost only
3. open a browser and paste `localhost:8080/build/InfoBase/index-eng.html` in the address bar

Note: if you use `npm run serve:open` instead you can connect from other devices on your local network (e.g. test from mobile) by visiting `<your IP>:8080/build/InfoBase/index-eng.html`. Note that your IP will change when you move networks/disconnect a network. `build`, or equivalent builds, needs to be restarted to update the IP env var, so if you have issues connecting to a local build from another device that's a good first step to try.

### TMUX to automate build

Once you have all of the environment set up for InfoBase development, you can follow the steps below to automate all of the build process in in one terminal screen using tmux (terminal multiplexer)

1. Install Homebrew (skip if you already have Homebrew, aren't on a Mac, or already have tmux): `cd /usr/local && mkdir homebrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C homebrew`
2. Install tmux: `brew install tmux`
3. Download/copy this [tmux config file](https://github.com/Stephen-ONeil/.dotfiles/blob/master/common/tmux/.tmux.conf), put it into your user folder (`~` directory)
4. Make sure you're on the root directory of InfoBase, and run: `npm run tmux_env`
5. Wait for everything to finish running. Once everything is running, you should be able to visit the local site

Note: closing the terminal will not kill the tmux session. To kill the session, run `tmux kill-session -t IB`. Re-running `npm run tmux_env` when an InfoBase tmux session already exists will reconnect you to the existing session, rather than starting a new one. If you wan a fresh restart, with the full scripted start up process, you must first kill any existing InfoBase sessions.

## Tests

### Browser tests

#### Route load tests

Route load tests are a quick and dirty form of fairly basic coverage. They just ensure that all routes are able to load without throwing an error.

1. Do a full dev build (run both `npm run webpack -- EN FR` and `npm run webpack -- EN FR A11Y`)
2. Have an active `npm run serve` process
3. `npm run cypress:run`

New route load tests can be added in `cypress/integration/InfoBase/route_tests.spec.js`.

# InfoBase du GC

## Table des matières

- [InfoBase du GC](#infobase-du-gc)
  - [Commencer](#commencer)
    - [Première installation](#premi%c3%a8re-installation)
    - [Lancez la compilation d'InfoBase du GC](#lancez-la-compilation-de-gc-infobase)
    - [Visitez une copie locale](#visitez-une-copie-locale)
  - [Tests](#tests-1)
    - [Tests de navigateur](#tests-de-navigateur)
      - [Tests de chargement](#tests-de-chargement)

## Commencer

### Première installation

1. InfoBase du GC nécessite l'installation de `npm`, `node`, et `git`
2. Démarrez un commande d'exécution et naviguez au chemin d’accès ou vous voulez placer le projet, p. ex. `cd ~/Documents`
3. `git clone https://github.com/TBS-EACPD/InfoBase.git`

### Lancez la compilation d'InfoBase du GC

0. Avec un commande d'exécution, naviguez au chemin d’accès au répertoire d'InfoBase du GC, p. ex. `cd ~/Documents/infobase/client`
1. `npm ci` pour télécharger les modules node.
2. `npm run build_static:watch` pour recueillir et empaqueter les fichiers statiques (les fichiers csv, svg, et css élargies de bootstrap). Ce processus peut être laissé en cours d'exécution pour détecter les changements.
3. `npm run gqlgen:watch` pour générer les fichiers .gql.ts à partir des fichiers .graphql
4. `npm run webpack -- EN FR` pour empaqueter le code source

### Visitez une copie locale

0. Les conditions préalables: 1) suivez les étapes de compilation précédentes, 2) suivez les étapes [ici](https://github.com/TBS-EACPD/InfoBase/blob/master/server/README.md) pour démarrer l'interface de programmation d'applications
1. Avec un commande d'exécution, naviguez au chemin d’accès de le côté client, p. ex. `cd ~/Documents/infobase/client`
2. `npm run serve` pour démarrer un serveur local
3. Démarrez un navigateur web et coller `localhost:8080/build/InfoBase/index-eng.html` dans la barre d'adresse

Notez: si vous utilisez la commande `npm run serve:open` vous pouvez relier à InfoBase du GC en utilisant les autres appareils sur votre réseau local (p. ex. pour tester le site mobile) par visiter `<votre IP>:8080/build/InfoBase/index-eng.html`. Notez que, si vous changez our débranchez le réseau, votre addresse IP changerait. Vous devez redémarrer la commande `build` ou l'équivalent pour mettre à jour la variable d'environnement de l'addresse IP. Ça c'est la première chose à essayer si vous avez des problèmes de connexion .

## Tests

### Tests de navigateur

#### Tests de chargement

Les tests de chargement fournissent une couverture de test de la forme « quick-and-dirty ». Ils vous assurent que tous les routes peuvent être naviguées sans générer d'erreurs.

1. Construire une version complète (Exécutez `webpack` et `webpack:a11y`)
2. Assurez-vous qu'un processus `npm run serve` est active
3. `npm run cypress:run`

Vous pouvez ajouter les tests additionnels dans le fichier `cypress/integration/InfoBase/route_tests.spec.js`.
