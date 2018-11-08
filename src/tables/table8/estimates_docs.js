const estimates_docs = {
  IM: {
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
    // tabled should only be set once MYA is available for the current 
    // year around the end of the summer
    order: 1,
    en: "Multi Year Appropriations",
    fr:"Crédits disponibles des précédents exercices",
  },
  VA: {
    // tabled should only be set once MYA is available for the current 
    // year around the end of the summer
    order: 11,
    en: "Voted Adjustments",
    fr: "Réajustement votés",
  },
  SA: {
    // tabled should only be set once MYA is available for the current 
    // year around the end of the summer
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
    order:12,
    en: "Deemed appropriation",
    fr: "Crédit réputé",
  },
};

export { estimates_docs as default };