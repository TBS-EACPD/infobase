import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components";

import type { TopicKey } from "src/models/footnotes/footnotes";

import { services_feature_flag } from "src/core/injected_build_constants";

import { LiteralKeyedRecordHelper } from "src/types/type_utils";

import { Frequencies } from "./Frequencies";

import text from "./Sources.yaml";

const { text_maker, TM } = create_text_maker_component(text);

type SourceDef = {
  name: string;
  description: React.ReactNode;
  topic_key: TopicKey;
  authoritative_link?: string;
  open_data_link?: string;
  frequency_key?: keyof typeof Frequencies;
};

const source_definitions = LiteralKeyedRecordHelper<SourceDef>()({
  inventory_of_government_organizations: {
    name: text_maker("inventory_of_government_organizations_name"),
    description: <TM k="inventory_of_government_organizations_desc" />,
    topic_key: "MACHINERY",
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  public_accounts: {
    name: text_maker("public_accounts_name"),
    description: <TM k="public_accounts_desc" />,
    topic_key: "PA",
    authoritative_link: text_maker("public_accounts_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  central_financial_management_system: {
    name: text_maker("central_financial_management_system_name"),
    description: <TM k="central_financial_management_system_desc" />,
    topic_key: "CFMRS",
    open_data_link: text_maker(
      "central_financial_management_system_open_data_link"
    ),
    frequency_key: "yearly",
  },
  estimates: {
    name: text_maker("estimates_name"),
    description: <TM k="estimates_desc" />,
    topic_key: "EST_PROC",
    authoritative_link: text_maker("estimates_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "quarterly",
  },
  departmental_plans: {
    name: text_maker("departmental_plans_name"),
    description: <TM k="departmental_plans_desc" />,
    topic_key: "DP",
    authoritative_link: text_maker("departmental_plans_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  departmental_results_reports: {
    name: text_maker("departmental_results_reports_name"),
    description: <TM k="departmental_results_reports_desc" />,
    topic_key: "DRR",
    authoritative_link: text_maker(
      "departmental_results_reports_authoritative_link"
    ),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  employee_pay_system: {
    name: text_maker("employee_pay_system_name"),
    description: <TM k="employee_pay_system_desc" />,
    topic_key: "PEOPLE",
    authoritative_link: text_maker("employee_pay_system_authoritative_link"),
    frequency_key: "yearly",
  },
  covid: {
    name: text_maker("covid_name"),
    description: <TM k="covid_desc" />,
    topic_key: "COVID",
    open_data_link: text_maker("covid_open_data_link"),
    frequency_key: "as_needed",
  },
  ...(services_feature_flag && {
    service_inventory: {
      name: text_maker("service_inventory_name"),
      description: <TM k="service_inventory_desc" />,
      topic_key: "SERVICES",
      open_data_link: text_maker("service_inventory_open_data_link"),
      frequency_key: "quarterly",
    },
  }),
});

export type SourceKey = keyof typeof source_definitions;

type Source = SourceDef & {
  key: SourceKey;
  frequency?: string;
};
export const Sources = _.mapValues(
  source_definitions,
  (def: SourceDef, key): Source => ({
    ...def,
    key: key as SourceKey,
    frequency:
      def.frequency_key !== undefined
        ? Frequencies[def.frequency_key]
        : undefined,
  })
);
