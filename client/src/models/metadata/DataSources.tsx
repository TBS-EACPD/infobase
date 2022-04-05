import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components";

import { services_feature_flag } from "src/core/injected_build_constants";

import { LiteralKeyedRecordHelper } from "src/types/type_utils";

import { Frequencies } from "./Frequencies";

import text from "./DataSources.yaml";

const { text_maker, TM } = create_text_maker_component(text);

type SourceDef = {
  name: string;
  description: React.ReactNode;
  authoritative_link?: string;
  open_data_link?: string;
  frequency_key?: keyof typeof Frequencies;
};

const source_definitions = LiteralKeyedRecordHelper<SourceDef>()({
  inventory_of_government_organizations: {
    name: text_maker("inventory_of_government_organizations_name"),
    description: <TM k="inventory_of_government_organizations_desc" />,
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  public_accounts: {
    name: text_maker("public_accounts_name"),
    description: <TM k="public_accounts_desc" />,
    authoritative_link: text_maker("public_accounts_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  central_financial_management_system: {
    name: text_maker("central_financial_management_system_name"),
    description: <TM k="central_financial_management_system_desc" />,
    open_data_link: text_maker(
      "central_financial_management_system_open_data_link"
    ),
    frequency_key: "yearly",
  },
  regional_transfer_payments: {
    name: text_maker("regional_transfer_payments_name"),
    description: <TM k="regional_transfer_payments_desc" />,
    open_data_link: text_maker("regional_transfer_payments_open_data_link"),
    frequency_key: "yearly",
  },
  estimates: {
    name: text_maker("estimates_name"),
    description: <TM k="estimates_desc" />,
    authoritative_link: text_maker("estimates_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "quarterly",
  },
  departmental_plans: {
    name: text_maker("departmental_plans_name"),
    description: <TM k="departmental_plans_desc" />,
    authoritative_link: text_maker("departmental_plans_authoritative_link"),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  departmental_results_reports: {
    name: text_maker("departmental_results_reports_name"),
    description: <TM k="departmental_results_reports_desc" />,
    authoritative_link: text_maker(
      "departmental_results_reports_authoritative_link"
    ),
    open_data_link: text_maker("common_infobase_open_data_link"),
    frequency_key: "yearly",
  },
  employee_pay_system: {
    name: text_maker("employee_pay_system_name"),
    description: <TM k="employee_pay_system_desc" />,
    authoritative_link: text_maker("employee_pay_system_authoritative_link"),
    frequency_key: "yearly",
  },
  covid: {
    name: text_maker("covid_name"),
    description: <TM k="covid_desc" />,
    open_data_link: text_maker("covid_open_data_link"),
    frequency_key: "as_needed",
  },
  ...(services_feature_flag && {
    service_inventory: {
      name: text_maker("service_inventory_name"),
      description: <TM k="service_inventory_desc" />,
      open_data_link: text_maker("service_inventory_open_data_link"),
      frequency_key: "yearly",
    },
  }),
});

export type DataSourceKey = keyof typeof source_definitions;

export const DataSources = _.mapValues(
  source_definitions,
  (def: SourceDef, key) => ({
    ...def,
    key: key as DataSourceKey,
    frequency:
      def.frequency_key !== undefined
        ? Frequencies[def.frequency_key]
        : undefined,
  })
);
