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

const service_std_type_en = {
  acs: "Access",
  acy: "Accuracy",
  oth: "Other",
  tml: "Timeliness",
};

const service_std_type_fr = {
  acs: "Accès",
  acy: "Exactitude",
  oth: "Autre",
  tml: "Délai",
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

export {
  digital_status_keys,
  application_channels_keys,
  channel_def_en,
  channel_def_fr,
  service_std_type_en,
  service_std_type_fr,
  service_type_en,
  service_type_fr,
};
