GC InfoBase
========

[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBase.svg?style=svg&circle-token=a99b6b8309e5edd904b0386c4a92c10bf5f43e29)](https://circleci.com/gh/TBS-EACPD/InfoBase)

*(Le Français suit)*

Client-side code and content for the GC InfoBase.

## Table of Contents
- [GC InfoBase](#GC-InfoBase)
  - [Table of Contents](#Table-of-Contents)
  - [Getting Started](#Getting-Started)
    - [First time setup](#First-time-setup)
    - [Building the InfoBase](#Building-the-InfoBase)
    - [Visiting a local build](#Visiting-a-local-build)
  - [Tests](#Tests)
    - [Browser tests](#Browser-tests)
      - [Route load tests](#Route-load-tests)

## Getting Started

### First time setup
0. Have npm, node, and git installed
1. Open a terminal and go to the directory where you want to store the project, e.g. `cd ~/Documents` 
2. `git clone https://github.com/TBS-EACPD/InfoBase.git` then enter your github credentials

### Building the InfoBase
0. Go to the client directory of your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
1. `npm ci` to get node modules
2. `npm run IB_base_watch` to gather and bundle static files (csv's, svg's, extended bootstrap css). Can be left running to watch for changes
3. `npm run IB_q` to webpack the source code (`IB_q` builds quickly, requires a browser with ES6 support) or `npm run IB_dev` (transpiles and polyfills for testing in IE11/safari/mobile)\*

\* `IB_q` and `IB_dev` are not the only flavours of build. See package.json for a list of all build comands

### Visiting a local build
0. prerequisites: 1) follow the build steps above, 2) follow the steps up through spinning up a local InfoBase API from the [server README](https://github.com/TBS-EACPD/InfoBase/blob/master/server/README.md)
1. Go to the client directory of your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
2. `npm run serve-loopback` to start a server in the InfoBase directory, localhost only
3. open a browser and paste `localhost:8080/build/InfoBase/index-eng.html` in the address bar

Note: if you use `npm run serve` you can connect from other devices on your local network (e.g. test from mobile) by visiting `<your IP>:8080/build/InfoBase/index-eng.html`. Note that your IP will change when you move networks/disconnect a network. IB_q, or equivalent, needs to be restarted to update the IP env var, so if you have issues connecting to a local build from another device that's a good first step to try.

## Tests

### Browser tests

#### Route load tests
Route load tests are a quick and dirty form of fairly basic coverage. They just ensure that all routes are able to load without throwing an error. 
1. Do a full prod build (run both `IB_prod` and `a11y_prod`)
2. Have an active `npm run serve-loopback` process
3. `npm run headless_route_load_tests`

New route load tests can be added in `browser-tests/route-load-tests-config.js`.



InfoBase du GC
========

**Code** et contenu pour le côté client de l'InfoBase du GC.

## Table des matières 

- [InfoBase du GC](#InfoBase-du-GC)
  - [Table des matières](#Table-des-matières)
  - [Commencer](#Commencer)
    - [Première installation](#Première-installation)
    - [Lancez la compilation de l'InfoBase](#Lancez-la-compilation-de-l'InfoBase)
    - [Visitez une copie locale](#Visitez-une-copie-locale)
  - [Tests](#Tests)
    - [Tests de navigateur](#Tests-de-navigateur)
      - [Tests de chargement](#Tests-de-chargement)

## Commencer

### Première installation
0. L'InfoBase requise `npm`, `node`, et `git`
1. Démarrez un commande d'exécution et naviguez au chemin d’accès ou vous voulez placer le projet, p. ex. `cd ~/Documents`
2. `git clone https://github.com/TBS-EACPD/InfoBase.git` et entrez votre nom d'utilisateur et mot de passe de github

### Lancez la compilation de l'InfoBase
0. Avec un commande d'exécution, naviguez au chemin d’accès au répertoire de l'InfoBase, p. ex. `cd ~/Documents/infobase/client`
1. `npm ci` pour télécharger les modules node.
2. `npm run IB_base_watch` pour recueillir et empaqueter les fichiers statiques (les fichiers csv, svg, et css élargies de bootstrap). Ce processus peut être laissé en cours d'exécution pour regarder les changements.
3. `npm run IB_q` pour empaqueter le code source (La commande `IB_q` compile rapidement mais elle requise un navigateur qui soutient ES6) ou `npm run IB_dev` (appliquer les «correctifs» pour résoudre les problèmes de soutien pour les navigateurs mobiles/IE11/safari)\*

### Visitez une copie locale

0. Les conditions préalables: 1) suivez les étapes de compilation précédentes, 2) suivez les étapes [ici](https://github.com/TBS-EACPD/InfoBase/blob/master/server/README.md) pour démarrer l'interface de programmation d'applications
1. Avec un commande d'exécution, naviguez au chemin d’accès de le côté client, p. ex. `cd ~/Documents/infobase/client`
2. `npm run serve-loopback` pour démarrer un serveur local
3. Démarrez un navigateur web et coller `localhost:8080/build/InfoBase/index-eng.html` dans la barre d'adresse

Notez: si vous utilisez la commande `npm run serve` vous pouvez relier à l'InfoBase en utilisant les autres appareils sur votre réseau local (p. ex. pour tester le site mobile) par visiter `<votre IP>:8080/build/InfoBase/index-eng.html`. Notez que, si vous changez our débranchez le réseau, votre addresse IP changerait. Vous devez redémarrer la commande `IB_q` ou l'équivalent pour mettre à jour la variable d'environnement de l'addresse IP. Se vous avez des problèmes de connexion ça c'est la première chose à essayer.

## Tests

### Tests de navigateur

#### Tests de chargement

