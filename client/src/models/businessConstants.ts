import _ from "lodash";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";
import { lang } from "src/core/injected_build_constants";

interface BusinessConceptTextValue {
  text: string;
}
interface BilingualBusinessConceptTextValue {
  en: string;
  fr: string;
}

type RawBusinessConceptInputTextValue =
  | BilingualBusinessConceptTextValue
  | BusinessConceptTextValue;

function getNormalizedEntry(
  obj: RawBusinessConceptInputTextValue
): BusinessConceptTextValue {
  if (obj.hasOwnProperty("text")) {
    return { text: (obj as BusinessConceptTextValue).text };
  } else if (obj.hasOwnProperty(lang)) {
    return { text: (obj as BilingualBusinessConceptTextValue)[lang] };
  } else {
    throw Error("shouldn't happen");
  }
}

interface RawBusinessConceptEntrySet {
  [key: string]: RawBusinessConceptInputTextValue;
}
interface BusinessConceptEntrySet {
  [key: string]: BusinessConceptTextValue;
}

function normalizeBilinguals(
  entries: RawBusinessConceptEntrySet
): BusinessConceptEntrySet {
  return _.mapValues(entries, (entry) => getNormalizedEntry(entry));
}

export const sos: {
  [key: number]: BusinessConceptTextValue;
} = normalizeBilinguals({
  1: {
    text: "Personnel",
  },
  2: {
    en: "Transportation and Telecommunications",
    fr: "Transports et communications",
  },
  3: {
    text: "Information",
  },
  4: {
    en: "Professional and Special Services",
    fr: "Services professionnels et spéciaux",
  },
  5: {
    en: "Rentals",
    fr: "Location",
  },
  6: {
    en: "Purchased Repair and Maintenance",
    fr: "Achat de services de réparation et d'entretien",
  },
  7: {
    en: "Utilities, Materials and Supplies",
    fr: "Services publics, fournitures et approvisionnements",
  },
  8: {
    en: "Acquisition of Land, Buildings, and Works",
    fr: "Acquisition de terrains, de bâtiments et d'ouvrages",
  },
  9: {
    en: "Acquisition of Machinery and Equipment",
    fr: "Acquisition de machines et de matériel",
  },
  10: {
    en: "Transfer Payments",
    fr: "Paiements de transfert",
  },
  11: {
    en: "Public Debt Charges",
    fr: "Frais de la dette",
  },
  12: {
    en: "Other Subsidies and Payments",
    fr: "Autres subventions et paiements",
  },
  20: {
    en: "Revenues",
    fr: "Revenus",
  },
  21: {
    en: "External Revenues",
    fr: "Revenus externes",
  },
  22: {
    en: "Internal Revenues",
    fr: "Revenus internes",
  },
});

export const tenure = normalizeBilinguals({
  ind: {
    en: "Indeterminate",
    fr: "Période indéterminée",
  },
  ter: {
    en: "Term",
    fr: "Période déterminée",
  },
  cas: {
    en: "Casual",
    fr: "Employé occasionnel",
  },
  stu: {
    en: "Student",
    fr: "Étudiant",
  },
  na: {
    en: "Not Available",
    fr: "Non disponible",
  },
});

export const provinces = normalizeBilinguals({
  ab: {
    en: "Alberta",
    fr: "Alberta",
  },
  abroad: {
    en: "Abroad",
    fr: "À l'étranger",
  },
  bc: {
    en: "British Columbia",
    fr: "Colombie-Britannique",
  },
  mb: {
    en: "Manitoba",
    fr: "Manitoba",
  },
  nb: {
    en: "New Brunswick",
    fr: "Nouveau-Brunswick",
  },
  ncr: {
    en: "NCR",
    fr: "RCN",
  },
  ns: {
    en: "Nova Scotia",
    fr: "Nouvelle-Écosse",
  },
  nt: {
    en: "Northwest Territories",
    fr: "Territoires du Nord-Ouest",
  },
  nu: {
    text: "Nunavut",
  },
  on: {
    text: "Ontario",
  },
  onlessncr: {
    en: "Ontario (non-NCR)",
    fr: "Ontario (hors RCN)",
  },
  pe: {
    en: "Prince Edward Island",
    fr: "Île-du-Prince-Édouard",
  },
  qc: {
    en: "Quebec",
    fr: "Québec",
  },
  qclessncr: {
    en: "Quebec (non-NCR)",
    fr: "Québec (hors RCN)",
  },
  sk: {
    text: "Saskatchewan",
  },
  yt: {
    text: "Yukon",
  },
  nl: {
    en: "Newfoundland and Labrador",
    fr: "Terre-Neuve-et-Labrador",
  },
  na: {
    en: "Not Available",
    fr: "Non disponible",
  },
});

export const provinces_short = normalizeBilinguals({
  ab: {
    text: "AB",
  },
  abroad: {
    en: "Abroad",
    fr: "À l'étranger",
  },
  bc: {
    text: "BC",
  },
  mb: {
    text: "MB",
  },
  nb: {
    text: "NB",
  },
  ncr: {
    en: "NCR",
    fr: "RCN",
  },
  ns: {
    en: "NS",
    fr: "NE",
  },
  nt: {
    en: "NT",
    fr: "TN",
  },
  nu: {
    text: "NU",
  },
  on: {
    text: "ON",
  },
  onlessncr: {
    en: "ON (non-NCR)",
    fr: "ON (hors RCN)",
  },
  pe: {
    text: "PE",
  },
  qc: {
    text: "QC",
  },
  qclessncr: {
    en: "QC (non-NCR)",
    fr: "QC (hors RCN)",
  },
  sk: {
    text: "SK",
  },
  yt: {
    text: "YT",
  },
  nl: {
    text: "NL",
  },
  na: {
    en: "N.A.",
    fr: "N.D.",
  },
});

export const le_provinces = normalizeBilinguals({
  ab: {
    text: "l'Alberta",
  },
  abroad: {
    text: "à l'étranger",
  },
  bc: {
    text: "la Colombie-Britannique",
  },
  mb: {
    text: "le Manitoba",
  },
  nb: {
    text: "le Nouveau-Brunswick",
  },
  ncr: {
    text: "la RCN",
  },
  ns: {
    text: "la Nouvelle-Écosse",
  },
  nt: {
    text: "les Territoires du Nord-Ouest",
  },
  nu: {
    text: "le Nunavut",
  },
  on: {
    text: "l'Ontario",
  },
  onlessncr: {
    text: "l'Ontario (hors RCN)",
  },
  pe: {
    text: "l'Île-du-Prince-Édouard",
  },
  qc: {
    text: "le Québec",
  },
  qclessncr: {
    text: "le Québec (hors RCN)",
  },
  sk: {
    text: "la Saskatchewan",
  },
  yt: {
    text: "le Yukon",
  },
  nl: {
    text: "le Terre-Neuve-et-Labrador",
  },
  na: {
    text: "le non disponible",
  },
});

export const de_provinces = normalizeBilinguals({
  ab: {
    text: "de l'Alberta",
  },
  abroad: {
    text: "de l'étranger",
  },
  bc: {
    text: "de la Colombie-Britannique",
  },
  mb: {
    text: "du Manitoba",
  },
  nb: {
    text: "du Nouveau-Brunswick",
  },
  ncr: {
    text: "de la RCN",
  },
  ns: {
    text: "de la Nouvelle-Écosse",
  },
  nt: {
    text: "des Territoires du Nord-Ouest",
  },
  nu: {
    text: "du Nunavut",
  },
  on: {
    text: "de l'Ontario",
  },
  onlessncr: {
    text: "de l'Ontario (hors RCN)",
  },
  pe: {
    text: "de l'Île-du-Prince-Édouard",
  },
  qc: {
    text: "du Québec",
  },
  qclessncr: {
    text: "du Québec (hors RCN)",
  },
  sk: {
    text: "de la Saskatchewan",
  },
  yt: {
    text: "du Yukon",
  },
  nl: {
    text: "de Terre-Neuve-et-Labrador",
  },
  na: {
    text: "de non disponible",
  },
});

export const age_groups = normalizeBilinguals({
  age30less: {
    en: "Age 29 and less",
    fr: "29 ans et moins",
  },
  age30to39: {
    en: "Age 30 to 39",
    fr: "30 à 39 ans",
  },
  age40to49: {
    en: "Age 40 to 49",
    fr: "40 à 49 ans",
  },
  age50to59: {
    en: "Age 50 to 59",
    fr: "50 à 59 ans",
  },
  age60plus: {
    en: "Age 60 and over",
    fr: "60 ans et plus",
  },
  na: {
    en: "Not Available",
    fr: "Non disponible",
  },
  sup: {
    en: "Suppressed Data",
    fr: "Données supprimées",
  },
});

export const ex_levels = normalizeBilinguals({
  ex1: {
    text: "EX 01",
  },
  ex2: {
    text: "EX 02",
  },
  ex3: {
    text: "EX 03",
  },
  ex4: {
    text: "EX 04",
  },
  ex5: {
    text: "EX 05",
  },
  non: {
    text: "Non-EX",
  },
});

export const fol = normalizeBilinguals({
  eng: {
    en: "English",
    fr: "Anglais",
  },
  fre: {
    en: "French",
    fr: "Français",
  },
  na: {
    en: "Not Available",
    fr: "Non disponible",
  },
  sup: {
    en: "Suppressed Data",
    fr: "Données supprimées",
  },
});

export const gender = normalizeBilinguals({
  male: {
    en: "Men",
    fr: "Hommes",
  },
  female: {
    en: "Women",
    fr: "Femmes",
  },
  na: {
    en: "Not Available",
    fr: "Non disponible",
  },
  sup: {
    en: "Suppressed Data",
    fr: "Données supprimées",
  },
});

export const result_statuses = normalizeBilinguals({
  met: {
    en: "Target met",
    fr: "Cible atteinte",
  },
  not_met: {
    en: "Target not met",
    fr: "Cible non atteinte",
  },
  not_available: {
    en: "Not available",
    fr: "Non disponible",
  },
  future: {
    en: "Result to be achieved in the future",
    fr: "Résultat à atteindre dans le future",
  },
});

export const months = normalizeBilinguals({
  0: {
    text: "",
  },
  1: {
    en: "January",
    fr: "Janvier",
  },
  2: {
    en: "February",
    fr: "Février",
  },
  3: {
    en: "March",
    fr: "Mars",
  },
  4: {
    en: "April",
    fr: "Avril",
  },
  5: {
    en: "May",
    fr: "Mai",
  },
  6: {
    en: "June",
    fr: "Juin",
  },
  7: {
    en: "July",
    fr: "Juillet",
  },
  8: {
    en: "August",
    fr: "Août",
  },
  9: {
    en: "September",
    fr: "Septembre",
  },
  10: {
    en: "October",
    fr: "Octobre",
  },
  11: {
    en: "November",
    fr: "Novembre",
  },
  12: {
    en: "December",
    fr: "Décembre",
  },
});

export const population_groups = normalizeBilinguals({
  fps: {
    en: "Federal Public Service",
    fr: "Fonction publique fédérale",
  },
  cpa: {
    en: "Core Public Administration",
    fr: "Administration publique centrale",
  },
  cpa_min_depts: {
    en: "Ministerial Departments",
    fr: "Ministères",
  },
  cpa_other_portion: {
    en: "Other Portions of the Core Public Administration",
    fr: "Autres secteurs de l’administration publique centrale",
  },
  separate_agencies: {
    en: "Separate Agencies",
    fr: "Organismes distincts",
  },
  na: {
    en: "Not applicable",
    fr: "Sans objet",
  },
});

export const transfer_payments = normalizeBilinguals({
  c: {
    en: "Contribution",
    fr: "Contribution",
  },
  g: {
    en: "Grant",
    fr: "Subvention",
  },
  o: {
    en: "Other Transfer Payment",
    fr: "Autre paiement de transfert",
  },
});

const NA_values = [
  "Not Available",
  "Non disponible",
  "NA",
  "N/A",
  "na",
  "n/a",
  "Non-EX",
];

const ex_level_target =
  lang === "en"
    ? ["Executive", "Non-Executive"]
    : ["Cadres supérieurs", "Non-cadres supérieursn"];
const compact_ex_level_map = {
  "EX 01": ex_level_target[0],
  "EX 02": ex_level_target[0],
  "EX 03": ex_level_target[0],
  "EX 04": ex_level_target[0],
  "EX 05": ex_level_target[0],
  "Non-EX": ex_level_target[1],
};

const ex_level_rev_map = _.chain(compact_ex_level_map)
  .toPairs()
  .groupBy(function (key_val) {
    return key_val[1];
  })
  .map(function (val, key) {
    return [key, _.map(val, 0)];
  })
  .fromPairs()
  .value();

const ex_level_stuff = {
  ex_level_target,
  compact_ex_level_map,
  ex_level_rev_map,
};

const estimates_docs = {
  IE: {
    order: 0,
    en: "Interim Estimates",
    fr: "Budget provisoire des dépenses",
  },
  MAINS: {
    order: 0,
    en: "Main Estimates",
    fr: "Budget principal",
  },
  MYA: {
    order: 1,
    en: "Multi Year Appropriations",
    fr: "Crédits disponibles des précédents exercices",
  },
  VA: {
    order: 11,
    en: "Voted Adjustments",
    fr: "Réajustement votés",
  },
  SA: {
    order: 12,
    en: "Statutory Adjustments",
    fr: "Réajustements législatifs",
  },
  SEA: {
    order: 2,
    en: "Supp. Estimates A",
    fr: "Budget supp. A",
  },
  SEB: {
    order: 3,
    en: "Supp. Estimates B",
    fr: "Budget supp. B",
  },
  SEC: {
    order: 4,
    en: "Supp. Estimates C",
    fr: "Budget supp. C",
  },
  V5: {
    order: 6,
    en: "Government Contingencies",
    fr: "Éventualités du gouvernement",
  },
  V10: {
    order: 7,
    en: "Operating Budget Carry Forward",
    fr: "Report du budget de fonctionnement",
  },
  V15: {
    order: 8,
    en: "Compensation adjustments",
    fr: "Rajustements à la rémunération",
  },
  V25: {
    order: 9,
    en: "Operating Budget Carry Forward",
    fr: "Report du budget de fonctionnement",
  },
  V30: {
    order: 10,
    en: "Paylist requirements",
    fr: "Besoins en matière de rémunération",
  },
  V33: {
    order: 11,
    en: "Capital Budget Carry Forward",
    fr: "Report du budget de dépenses en capital",
  },
  DEEM: {
    order: 12,
    en: "Deemed appropriation",
    fr: "Crédit réputé",
  },
};

const businessConstants = {
  sos,
  tenure,
  provinces,
  provinces_short,
  le_provinces,
  de_provinces,
  age_groups,
  ex_levels,
  fol,
  gender,
  result_statuses,
  months,
  population_groups,
  transfer_payments,
  ...ex_level_stuff,
  estimates_docs,
  NA_values,
};

assign_to_dev_helper_namespace({ businessConstants });

export { businessConstants };
