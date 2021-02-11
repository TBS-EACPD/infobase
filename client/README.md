[![CircleCI](https://circleci.com/gh/TBS-EACPD/infobase.svg?style=shield)](https://circleci.com/gh/TBS-EACPD/infobase)

*(le Français suit)*

GC InfoBase
========

Client-side code and content for the GC InfoBase. / Code et contenu pour le côté client d'InfoBase du GC.

*(Le Français suit)*

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

### First time setup
1. Have npm, node, and git installed
2. Open a terminal and go to the directory where you want to store the project, e.g. `cd ~/Documents` 
3. `git clone https://github.com/TBS-EACPD/InfoBase.git`

### Building GC InfoBase
0. Go to the client directory of your GC InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
1. `npm install` to get node modules
2. `npm run IB_base_watch` to gather and bundle static files (csv's, svg's, extended bootstrap css). Can be left running to watch for changes
3. `npm run IB_q` to webpack the source code (`IB_q` builds quickly, requires a browser with ES6 support) or `npm run IB_dev` (transpiles and polyfills for testing in IE11/safari/mobile)\*

\* `IB_q` and `IB_dev` are not the only flavours of build. See package.json for a list of all build comands

### Visiting a local build
0. prerequisites: 1) follow the build steps above, 2) follow the steps up through spinning up a local GC InfoBase API from the [server README](https://github.com/TBS-EACPD/InfoBase/blob/master/server/README.md)
1. Go to the client directory of your GC InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
2. `npm run serve-loopback` to start a server in GC InfoBase directory, localhost only
3. open a browser and paste `localhost:8080/build/InfoBase/index-eng.html` in the address bar

Note: if you use `npm run serve` you can connect from other devices on your local network (e.g. test from mobile) by visiting `<your IP>:8080/build/InfoBase/index-eng.html`. Note that your IP will change when you move networks/disconnect a network. IB_q, or equivalent, needs to be restarted to update the IP env var, so if you have issues connecting to a local build from another device that's a good first step to try.

## Tests

### Browser tests

#### Route load tests
Route load tests are a quick and dirty form of fairly basic coverage. They just ensure that all routes are able to load without throwing an error. 
1. Do a full prod build (run both `IB_prod` and `a11y_prod`)
2. Have an active `npm run serve-loopback` process
3. `npm run route_load_tests`

New route load tests can be added in `browser-tests/route-load-tests-config.js`.



InfoBase du GC
========


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
2. `npm run IB_base_watch` pour recueillir et empaqueter les fichiers statiques (les fichiers csv, svg, et css élargies de bootstrap). Ce processus peut être laissé en cours d'exécution pour détecter les changements.
3. `npm run IB_q` pour empaqueter le code source (La commande `IB_q` compile rapidement mais vous auriez besoin d'un navigateur qui soutient ES6) ou `npm run IB_dev` (appliquer les « correctifs » pour résoudre les problèmes de soutien pour les navigateurs mobiles/IE11/safari)\*

### Visitez une copie locale

0. Les conditions préalables: 1) suivez les étapes de compilation précédentes, 2) suivez les étapes [ici](https://github.com/TBS-EACPD/InfoBase/blob/master/server/README.md) pour démarrer l'interface de programmation d'applications
1. Avec un commande d'exécution, naviguez au chemin d’accès de le côté client, p. ex. `cd ~/Documents/infobase/client`
2. `npm run serve-loopback` pour démarrer un serveur local
3. Démarrez un navigateur web et coller `localhost:8080/build/InfoBase/index-eng.html` dans la barre d'adresse

Notez: si vous utilisez la commande `npm run serve` vous pouvez relier à InfoBase du GC en utilisant les autres appareils sur votre réseau local (p. ex. pour tester le site mobile) par visiter `<votre IP>:8080/build/InfoBase/index-eng.html`. Notez que, si vous changez our débranchez le réseau, votre addresse IP changerait. Vous devez redémarrer la commande `IB_q` ou l'équivalent pour mettre à jour la variable d'environnement de l'addresse IP. Ça c'est la première chose à essayer si vous avez des problèmes de connexion .

## Tests

### Tests de navigateur

#### Tests de chargement

Les tests de chargement fournissent une couverture de test de la forme « quick-and-dirty ». Ils vous assurent que tous les routes peuvent être naviguées sans générer d'erreurs.

1. Construire une version complète (Exécutez `IB_prod` et `a11y_prod`)
2. Assurez-vous qu'un processus `npm run serve-loopback` est active
3. `npm run route_load_tests`

Vous pouvez ajouter les tests additionnels dans le fichier `browser-tests/route-load-tests-config.js`.

