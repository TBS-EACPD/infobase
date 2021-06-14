[![CircleCI](https://circleci.com/gh/TBS-EACPD/infobase.svg?style=shield)](https://circleci.com/gh/TBS-EACPD/infobase)

_(Le Français suit)_

# GC InfoBase Mono-Repo

GC InfoBase is an interactive data-visualization tool, transforming complex federal data into simple visual stories for Canadians. Since its creation in 2013, GC InfoBase has been recognized as the authoritative source of Government expenditure information by the Parliamentary Budget Officer (PBO) and was identified as a public sector innovation by the Organisation for Economic Co-operation and Development (OECD) Observatory of Public Sector Innovation (OPSI). The tool contains years’ worth of federal government data, bringing together information previously scattered across over 500 government reports.

The live site can be found [here](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html), where our [about page](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html#about) contains further details on who we are and what we do.

This repository contains the following projects:

1. GC InfoBase single page application ([/client](https://github.com/TBS-EACPD/InfoBase/blob/master/client))
2. GC InfoBase data API ([/server](https://github.com/TBS-EACPD/InfoBase/blob/master/server)) [![Test coverage status badge](https://storage.googleapis.com/all-test-coverage/master-server-coverage-badge.svg)](https://storage.googleapis.com/all-test-coverage/master-server-coverage.txt)
3. GC InfoBase email backend ([/email_backend](https://github.com/TBS-EACPD/InfoBase/blob/master/email_backend)) [![Test coverage status badge](https://storage.googleapis.com/all-test-coverage/master-email_backend-coverage-badge.svg)](https://storage.googleapis.com/all-test-coverage/master-email_backend-coverage.txt)

See the README.md files in those respective directories for more details on each project.

## License

Unless otherwise noted, the source code of this project is covered under Crown Copyright, Government of Canada, and is distributed under the [MIT License](LICENSE).

The Canada wordmark and related graphics associated with this distribution are protected under trademark law and copyright law. No permission is granted to use them outside the parameters of the Government of Canada's corporate identity program. For more information, see [Federal identity requirements](https://www.canada.ca/en/treasury-board-secretariat/topics/government-communications/federal-identity-requirements.html).

All data in `data/` is released under the terms of the [Open Government Licence – Canada](https://open.canada.ca/en/open-government-licence-canada). See the [Datasets](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html#metadata) page for links to the individual open data pages for each dataset.

# « Mono-Dépôt » d'InfoBase du GC

InfoBase du GC est un outil interactif de visualisation de données, qui traduit en termes simples l’information complexe du gouvernement fédéral au profit des Canadiens. Depuis sa création en 2013, InfoBase du GC a été reconnue par le directeur parlementaire du budget (DPB) comme étant la source d’information faisant autorité en matière de dépenses gouvernementales et est considérée comme une innovation dans le secteur public par l’Observatoire sur l’innovation dans le secteur public (OISP) de l’Organisation de coopération et de développement économiques (OCDE). L’outil contient plusieurs années de renseignements gouvernementaux, auparavant éparpillés dans plus de 500 rapports à l’échelle de la fonction publique fédérale.

Le site en direct est [ici](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-fra.html). Notre page [Qui sommes-nous](http://localhost:8080/build/InfoBase/index-fra.html#about) contient les details supplémentaires sur le sujet de nous-mêmes.

Ce dépôt est divisé en trois:

1. l'outil InfoBase (dans le fichier [/client](https://github.com/TBS-EACPD/InfoBase/blob/master/client))
2. l'interface de programmation d'applications (API) (dans le fichier [/server](https://github.com/TBS-EACPD/InfoBase/blob/master/server))
3. l'application dorsale pour lancer des courriels (dans le fichier [/email_backend](https://github.com/TBS-EACPD/InfoBase/blob/master/email_backend))

Veuillez liser le fichier « README.md » dans chancune de ces fichiers pour connaisser plus de détails.

## Licence

Sauf indication contraire, le code source de ce projet est protégé par le droit d'auteur de la Couronne du gouvernement du Canada et distribué sous la [licence MIT](LICENSE).

Le mot-symbole « Canada » et les éléments graphiques connexes liés à cette distribution sont protégés en vertu des lois portant sur les marques de commerce et le droit d'auteur. Aucune autorisation n'est accordée pour leur utilisation à l'extérieur des paramètres du programme de coordination de l'image de marque du gouvernement du Canada. Pour obtenir davantage de renseignements à ce sujet, veuillez consulter les [Exigences pour l'image de marque](https://www.canada.ca/fr/secretariat-conseil-tresor/sujets/communications-gouvernementales/exigences-image-marque.html).

Tous les données dans `data/` sont visées par la [Licence du gouvernement ouvert – Canada](https://ouvert.canada.ca/fr/licence-du-gouvernement-ouvert-canada). Veuillez consulter le site [Données](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-fra.html#metadata) pour trouver les liens vers les données ouvertes.
