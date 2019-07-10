const index_lang_lookups = {
  page_title: {
    en: "GC InfoBase",
    fr: "L'InfoBase du GC",
  },
  logo_link: {
    en: "https://www.canada.ca/en.html",
    fr: "https://www.canada.ca/fr.html",
  },
  logo_a11y_label: {
    en: "Government of Canada",
    fr: "Gouvernement du Canada",
  },
  logo_a11y_label_2: {
    en: "Symbol of the Government of Canada",
    fr: "Symbole du gouvernement du Canada",
  },
  lang: {
    en: "en",
    fr: "fr",
  },
  meta_description: {
    en: "The GC InfoBase is the government’s interactive data-visualization tool, which transforms complex financial, people, and results data into simple, visual stories. Discover how much the federal government spent, how many people we employed, and what results we achieved.",
    fr: "L’InfoBase du GC est un outil interactif de visualisation des données qui traduit visuellement en termes simples l’information gouvernementale sur les finances, les résultats et la gestion des personnes. Trouver combien le gouvernement fédéral a dépensé, combien de personne il emploi et quels sont les résultats qu’il a accomplis.",
  },
  other_lang_name: {
    en: "Français",
    fr: "English",
  },

  you_are_here: {
    en: "You are here",
    fr: "Vous êtes ici",
  },
  please_enable_js: {
    en: "Please enable javascript",
    fr: "Veuillez activer javascript",
  },
  app_requires_js: {
    en: "This web application requires javascript",
    fr: "L'utilisation de cette application web requiert javascript",
  },
  top_of_page: {
    en: "Top of page",
    fr: "Haut de la page",
  },
  about_this_site: {
    en: "About this site",
    fr: "À propos de ce site",
  },
  skip_to_main_content: {
    en: "Skip to main content",
    fr: "Passer au contenu principal",
  },
  bonus_footer_list: {
    en: `
     <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/en/contact.html">Contact us</a></li>
     <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/en/government/dept.html">Departments and agencies</a></li>
     <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/en/government/publicservice.html">Public service and military</a></li>
     <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/en/news.html">News</a></li>
     <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/en/government/system/laws.html">Treaties, laws and regulations</a></li>
     <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/en/transparency/reporting.html">Government-wide reporting</a></li>
     <li><a target="_blank" rel="noopener noreferrer" href="https://pm.gc.ca/eng">Prime Minister</a></li>
     <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/en/government/system.html">How government works</a></li>
     <li><a target="_blank" rel="noopener noreferrer" href="https://open.canada.ca/en/">Open government</a></li>
    `,
    fr: `
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/fr/contact.html">Contactez-nous</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/fr/gouvernement/min.html">Ministères et organismes</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/fr/gouvernement/fonctionpublique.html">Fonction publique et force militaire</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/fr/nouvelles.html">Nouvelles</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/fr/gouvernement/systeme/lois.html">Traités, lois et règlements</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/fr/transparence/rapports.html">Rapports à l'échelle du gouvernement</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://pm.gc.ca/fra">Premier ministre</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/fr/gouvernement/systeme.html">Comment le gouvernement fonctionne</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://ouvert.canada.ca/">Gouvernement ouvert</a></li>
    `,
  },
  footer_list: {
    en: `
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/en.html">Visit Canada.ca</a></li>
    `,
    fr: `
      <li><a target="_blank" rel="noopener noreferrer" href="https://www.canada.ca/fr.html">Visiter Canada.ca</a></li>
    `,
  },
  script_url: {
    en: "app-en.min.js",
    fr: "app-fr.min.js",
  },
  a11y_script_url: {
    en: "app-a11y-en.min.js",
    fr: "app-a11y-fr.min.js",
  },
  other_lang_href: {
    en: "index-fra.html",
    fr: "index-eng.html",
  },
  a11y_other_lang_href: {
    en: "index-basic-fra.html",
    fr: "index-basic-eng.html",
  },
  a11y_version_url: {
    en: "index-basic-eng.html",
    fr: "index-basic-fra.html",
  },
  a11y_version_text: {
    en: "Text based version",
    fr: "Version basé en texte",
  },
  standard_version_url: {
    en: "index-eng.html",
    fr: "index-fra.html",
  },
  standard_version_text: {
    en: "Standard version",
    fr: "Version standard",
  },
};

// Used by copy_static_asset, node only supports commonjs syntax
module.exports = { index_lang_lookups };
