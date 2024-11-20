const digital_status_keys = [
  "issue_res_digital",
  "issuance_digital",
  "decision_digital",
  "application_digital",
  "authentication",
  "account_reg_digital",
];
const application_channels_keys = [
  "other_application_count",
  "phone_application_count",
  "live_application_count",
  "mail_application_count",
  "online_application_count",
];

const channel_def_en = {
  eml: "Email",
  fax: "Fax",
  person: "In-Person",
  non: "None",
  onl: "Online",
  post: "Postal Mail",
  tel: "Telephone",
  oth: "Other",
};

const channel_def_fr = {
  eml: "Courriel",
  fax: "Fax",
  person: "En personne",
  non: "Aucun",
  onl: "En ligne",
  post: "Courrier postal",
  tel: "Téléphone",
  oth: "Autre",
};

const service_std_type_fr = {
  Access: "Access",
  Accuracy: "Accuracy",
  Other: "Other",
  Timeliness: "Rapidité",
};

const service_type_en = {
  cer: "Care, Education, Recreation",
  gnc: "Grants and Contributions",
  reg_vol: "High Volume Regulatory Transactions",
  res: "Resources",
  apir: "Agreements, Permissions, Inspections, Rulings",
  lrp: "Legislation, Regulation, Policy",
  info: "Information",
  ppi: "Penalties, Protection, Intervention",
};

const service_type_fr = {
  cer: "Soins, éducation, loisirs",
  gnc: "Subventions et Contributions",
  reg_vol: "Transaction réglementaires à demande élevée",
  res: "Resources",
  apir: "Accords, autorisations, inspections, décisions",
  lrp: "Législation, réglementation, politique",
  info: "Information",
  ppi: "Pénalités, protection, intervention",
};

const scope_def_en = {
  intern: "Internal Service",
  extern: "External Service",
  enterprise: "Internal Enterprise Service",
  "intern cluster": "Internal Service Cluster",
};

const scope_def_fr = {
  intern: "Service interne",
  extern: "Service externe",
  enterprise: "Service interne integré",
  "intern cluster": "Service interne cluster",
};

const target_group_en = {
  econom: "Economic Segments (Businesses)",
  for: "Foreign Entities",
  intern_gov: "Internal to Government",
  NGO: "Non Profit Institutions and Organizations",
  persons: "Persons",
  PTC: "Provinces, Territories or Communities",
  enviro: "Environmental",
};

const target_group_fr = {
  econom: "Segments économiques",
  for: "Entités étrangères",
  intern_gov: "Interne au gouvernement",
  NGO: " Institutions et organisations sans but lucratif",
  persons: "Étiquettes associées aux personnes",
  PTC: "Provinces, territoires et communautés",
  enviro: "Environnemental",
};

const ident_platform_en = {
  ex_auth:
    "Cyber Auth/ECM - External (Public) credential and authentication (GCKey, CBS)",
  signin_authenti: "Sign In Canada",
  gcpass: "GCpass/ICAS (Internal Centralized Authentication Service)",
  in_auth:
    "ICM - Internal (GC worker) credential and authentication service (myKEY)",
  oth: "Other",
  na: "N/A (not applicable)",
};

const ident_platform_fr = {
  ex_auth:
    "Authentification électronique/GJE - Service de gestion des justificatifs externes (CléGC, SCJI)",
  signin_authenti: "Authenti-Canada",
  gcpass: "GCpass/SICA (le Service Interne Centralizé d'Authentification)",
  in_auth: "GJI - Service de gestion des justificatifs internes (maClé)",
  oth: "Autre",
  na: "S.O. (n’est pas applicable)",
};

const accessibility_assessors_en = {
  "301-549": "EN 301-549 (2018) standard",
  na: "Not applicable",
  "Not assessed": "Not assessed",
  other: "Other accessibility criteria",
  persons: "Persons with disability involved in the assessment or testing",
  wcag20: "WCAG 2.0 AA standard",
  wcag21: "WCAG 2.1 AA standard",
  "TBS/WCAG plain language requirement": "TBS/WCAG plain language requirement",
};
const accessibility_assessors_fr = {
  "301-549": "Norme EN 301-549 (2018)",
  na: "Sans objet",
  "not assessed": "Non évalué",
  other: "Autres critères d’accessibilité",
  persons: "Personnes handicapées participant à l’évaluation ou au test",
  wcag20: "Norme des WCAG 2.0 AA",
  wcag21: "Norme des WCAG 2.1 AA",
  "TBS/WCAG plain language requirement":
    "Exigence en matière de langage clair liée au Secrétariat du Conseil du Trésor (SCT)/Règles pour l’accessibilité des contenus Web (WCAG)",
};

const service_recipient_type_en = {
  client: "Targeted, Client-based Services",
  societal: "Untargeted, Societal-based Service",
};

const service_recipient_type_fr = {
  client: "Services ciblés axés sur les clients",
  societal: "Services non ciblés axés sur la société",
};

export {
  digital_status_keys,
  application_channels_keys,
  channel_def_en,
  channel_def_fr,
  service_std_type_fr,
  service_type_en,
  service_type_fr,
  scope_def_en,
  scope_def_fr,
  target_group_en,
  target_group_fr,
  ident_platform_en,
  ident_platform_fr,
  accessibility_assessors_en,
  accessibility_assessors_fr,
  service_recipient_type_en,
  service_recipient_type_fr,
};
