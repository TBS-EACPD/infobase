import { lang } from "src/core/injected_build_constants";

import { smart_sort_func } from "src/sort_utils";

// TODO ideally CURRENT_EST_DOC could be derived from input data and injected in to the app at build time, or something like that
// For now, needs to be manually updated on new estimates publication!
export const CURRENT_EST_DOC: "MAINS" | "SEA" | "SEB" | "SEC" | "SW1" = "SEA";

// Add a new helper function to check for Special Warrants
export const isSpecialWarrants = () => CURRENT_EST_DOC.startsWith("SW");

export const estimates_docs = {
  MAINS: {
    en: "Main Estimates",
    fr: "Budget principal",
    order: 0,
  },
  MYA: {
    en: "Multi Year Appropriations",
    fr: "Crédits disponibles des précédents exercices",
    order: 1,
  },
  VA: {
    en: "Voted Adjustments",
    fr: "Réajustement votés",
    order: 1.1,
  },
  SA: {
    en: "Statutory Adjustments",
    fr: "Réajustements législatifs",
    order: 1.2,
  },
  SEA: {
    en: "Supp. Estimates A",
    fr: "Budget supp. A",
    order: 2,
  },
  SEB: {
    en: "Supp. Estimates B",
    fr: "Budget supp. B",
    order: 3,
  },
  SEC: {
    en: "Supp. Estimates C",
    fr: "Budget supp. C",
    order: 4,
  },
  SW1: {
    en: "Special Warrant, Order in Council P.C. 2025-462 of April 1, 2025",
    fr: "Mandat spécial, vertu du décret C.P. 2025-462 du 1er avril 2025",
    order: 5,
  },
} as const;

export type est_doc = keyof typeof estimates_docs;

export const get_est_doc_glossary_key = (est_doc: est_doc) =>
  ({
    MAINS: "MAINS",
    MYA: "MYA",
    VA: "VOTED",
    SA: "ADJUS",
    SEA: "SUPPSA",
    SEB: "SUPPSB",
    SEC: "SUPPSC",
    SW1: "SW1",
  }[est_doc]);

export const get_est_doc_name = (est_doc: est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc][lang] : "";

export const get_est_doc_order = (est_doc: est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc].order : 9999;

export const est_doc_sort_func = (
  est_doc_a: est_doc,
  est_doc_b: est_doc,
  descending: boolean
) => {
  const order_a = get_est_doc_order(est_doc_a);
  const order_b = get_est_doc_order(est_doc_b);

  return smart_sort_func(order_a, order_b, descending);
};
