import { scaleLinear } from "d3-scale";
import _ from "lodash";
import React, { memo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  DisplayTable,
  LeafSpinner,
} from "src/components/index";

import {
  useOrgPeopleSummary,
  useGovPeopleSummary,
} from "src/models/people/queries";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { Canada } from "src/charts/canada/index";

import { calculate_common_text_args } from "./calculate_common_text_args";

import text from "./employee_prov.yaml";

const { text_maker, TM } = create_text_maker_component(text);
const { people_years } = year_templates;
const years = _.map(people_years, (y) => run_template(y));

const EmployeeProvPanel = ({
  title,
  subject,
  footnotes,
  sources,
  datasets,
  subject_type,
}) => {
  const { data: orgData, loading: orgLoading } = useOrgPeopleSummary({
    org_id: subject.id,
  });

  const { data: govData, loading: govLoading } = useGovPeopleSummary({});

  // Select the appropriate data based on subject_type
  const data = subject_type === "gov" ? govData : orgData;
  const loading = subject_type === "gov" ? govLoading : orgLoading;

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!data?.region) {
    return null;
  }

  const formatted_data = data.region
    .filter((region) => region && region.yearly_data)
    .map((region) => ({
      label: region.dimension,
      data: region.yearly_data
        .filter((entry) => entry)
        .map((year) => year.value),
      five_year_percent: region.avg_share,
    }))
    .filter((item) => _.some(item.data, (val) => val !== null && val !== 0));

  // Map of full province names to dimension codes
  const regionToProvinceCode = {
    Alberta: "ab",
    "British Columbia": "bc",
    Manitoba: "mb",
    "New Brunswick": "nb",
    "Newfoundland and Labrador": "nl",
    "Nova Scotia": "ns",
    "Northwest Territories": "nt",
    Nunavut: "nu",
    "Ontario (minus the NCR)": "onlessncr",
    "Prince Edward Island": "pe",
    "Quebec (minus the NCR)": "qclessncr",
    Saskatchewan: "sk",
    Yukon: "yt",
    "National Capital Region (NCR)": "ncr",
    "Outside of Canada": "abroad",
    Unknown: "na",
  };

  // Transform data for the Canada component
  const yearly_data = [];
  formatted_data.forEach((region) => {
    region.data.forEach((value, index) => {
      if (!yearly_data[index]) {
        yearly_data[index] = {};
      }
      const dimensionCode = regionToProvinceCode[region.label];
      if (dimensionCode && value !== null && value !== 0) {
        yearly_data[index][dimensionCode] = value;
      }
    });
  });

  // Calculate totals by year for the bar chart
  const alt_totals_by_year = yearly_data.map((yearData) =>
    _.sum(Object.values(yearData))
  );

  // Calculate color scale
  const max_value = Math.max(...formatted_data.flatMap((d) => d.data));
  const color_scale = scaleLinear().domain([0, max_value]).range([0.2, 1]);

  const graph_args = {
    data: yearly_data,
    years: people_years,
    color_scale,
    formatter: formats.big_int_raw,
    alt_totals_by_year,
  };

  const common_text_args = calculate_common_text_args(formatted_data);
  const text_calculations = {
    ...common_text_args,
    subject,
    top_avg_group: common_text_args.top_avg_group,
  };

  const MemoizedCanada = memo(Canada);

  return (
    <StdPanel {...{ title, footnotes, sources, datasets }}>
      <Col size={12} isText>
        <TM k={subject_type + "_employee_prov_text"} args={text_calculations} />
      </Col>
      {!is_a11y_mode && (
        <Col size={12} isGraph>
          <MemoizedCanada graph_args={graph_args} />
        </Col>
      )}
      {is_a11y_mode && (
        <Col size={12} isGraph>
          <DisplayTable
            column_configs={{
              label: {
                index: 0,
                header: text_maker("prov"),
                is_searchable: true,
              },
              five_year_percent: {
                index: years.length + 1,
                header: text_maker("five_year_percent_header"),
                formatter: "percentage1",
              },
              ..._.chain(years)
                .map((year, idx) => [
                  year,
                  {
                    index: idx + 1,
                    header: year,
                    formatter: "big_int",
                  },
                ])
                .fromPairs()
                .value(),
            }}
            data={formatted_data}
          />
        </Col>
      )}
    </StdPanel>
  );
};

export const declare_employee_prov_panel = () =>
  declare_panel({
    panel_key: "employee_prov",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      get_dataset_keys: () => ["employee_region"],
      get_title: () => text_maker("employee_prov_title"),
      render(props) {
        return <EmployeeProvPanel {...props} subject_type={subject_type} />;
      },
    }),
  });
