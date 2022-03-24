import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { year_templates } from "src/models/years";

import text from "./orgTransferPaymentsRegion.yaml";

const { provinces } = businessConstants;
const { tp_by_region_years } = year_templates;

export default {
  text,
  id: "orgTransferPaymentsRegion",
  source: ["RTP", "PA"],
  tags: ["TP_GEO", "SOBJ10"],

  link: {
    en: "https://open.canada.ca/data/en/dataset/69bdc3eb-e919-4854-bc52-a435a3e19092",
    fr: "https://ouvert.canada.ca/data/fr/dataset/69bdc3eb-e919-4854-bc52-a435a3e19092",
  },

  name: {
    en: "Transfer Payments by recipient region",
    fr: "Paiements de transfert par région du bénéficiaire",
  },

  add_cols: function () {
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "dept",
      header: "",
      can_group_by: true,
    });
    this.add_col({
      type: "short-str",
      key: true,
      hidden: true,
      not_for_display: true,
      nick: "region_code",
      header: "",
    });
    this.add_col({
      key: true,
      type: "short-str",
      nick: "region",
      header: {
        en: "Geographic Region",
        fr: "Région géographique",
      },
      can_group_by: true,
    });
    _.each(tp_by_region_years, (header) => {
      this.add_col({
        type: "big_int",
        nick: header,
        header: header,
        description: {
          en: `Amount of transfer payment in ${header}`,
          fr: `Montant du paiement de transfert en ${header}`,
        },
      });
    });
  },

  mapper: (row) => {
    const [org_id, prov_code, ...values] = row;
    const prov_text = provinces[prov_code].text;
    return [org_id, prov_code, prov_text, ...values];
  },

  sort: (mapped_rows) =>
    _.sortBy(mapped_rows, (row) => {
      if (row.region === provinces.abroad.text) {
        return "Z";
      }
      if (row.region[0] === "Î") {
        return "I";
      }
      return row.region;
    }),
};
