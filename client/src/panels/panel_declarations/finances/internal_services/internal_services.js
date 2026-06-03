import _ from "lodash";
import React, { useMemo } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  GraphOverlay,
  LeafSpinner,
} from "src/components/index";

import { calculate_internal_services_from_finance_data } from "src/models/finances/internal_services_calculations";
import { useInternalServicesFinanceData } from "src/models/finances/useInternalServicesFinanceData";

import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { infobase_colors } from "src/core/color_schemes";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import text from "./internal_services.yaml";

const { std_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);

const InternalServicesPanel = ({
  title,
  subject,
  calculations,
  sources,
  datasets,
  footnotes,
}) => {
  const { gov_fte_total, gov_isc_fte, total_fte, isc_fte, series } =
    calculations;

  const years = _.map(std_years, (yr) => run_template(yr));
  const label_keys = [
    text_maker("internal_services"),
    text_maker("other_programs"),
  ];
  const colors = infobase_colors();

  const first_active_isc = _.findIndex(
    series,
    (data) => data[label_keys[0]] !== 0
  );
  const last_active_isc = _.findLastIndex(
    series,
    (data) => data[label_keys[0]] !== 0
  );

  const bar_series = _.reduce(
    label_keys,
    (result, label_value) => {
      _.assign(
        result,
        _.fromPairs([[label_value, _.map(series, label_value)]])
      );
      return result;
    },
    {}
  );

  const bar_data = _.chain(years)
    .map((date, date_index) => ({
      date,
      ..._.chain(bar_series)
        .map((data, label) => [label, data[date_index]])
        .fromPairs()
        .value(),
    }))
    .filter(
      (isc, isc_index) =>
        isc_index >= first_active_isc && isc_index <= last_active_isc
    )
    .value();

  const legend_items = _.reduce(
    label_keys,
    (result, label_value) => {
      result.push({
        id: label_value,
        label: label_value,
        color: colors(label_value),
      });
      return result;
    },
    []
  );

  const to_render = (
    <div>
      <div className="medium-panel-text" style={{ marginBottom: "15px" }}>
        <TM
          k="internal_service_panel_text"
          args={{
            subject,
            isc_fte_pct: isc_fte / total_fte,
            gov_isc_fte_pct: gov_isc_fte / gov_fte_total,
          }}
        />
      </div>
      <div className="row md-middle">
        {!is_a11y_mode && (
          <div className="col-12 col-lg-3">
            <StandardLegend
              legendListProps={{
                items: legend_items,
                checkBoxProps: { isSolidBox: true },
              }}
            />
          </div>
        )}
        <div className="col-12 col-lg-9">
          <GraphOverlay>
            <WrappedNivoBar
              data={bar_data}
              indexBy="date"
              colors={(d) => colors(d.id)}
              keys={label_keys}
              is_money={false}
              margin={{
                top: 15,
                right: 30,
                bottom: 40,
                left: 50,
              }}
              graph_height="300px"
            />
          </GraphOverlay>
        </div>
      </div>
    </div>
  );

  return (
    !_.isEmpty(bar_data) && (
      <InfographicPanel {...{ title, sources, datasets, footnotes }}>
        {to_render}
      </InfographicPanel>
    )
  );
};

const InternalServicesContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } = useInternalServicesFinanceData(subject);

  const isc_label = text_maker("internal_services");
  const non_isc_label = text_maker("other_programs");

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_internal_services_from_finance_data(subject, finance_data, {
      isc_label,
      non_isc_label,
    });
  }, [loading, subject, finance_data, isc_label, non_isc_label]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return (
    <InternalServicesPanel
      {...props}
      title={text_maker("internal_service_panel_title")}
      calculations={calculations}
    />
  );
};

export const declare_internal_services_panel = () =>
  declare_panel({
    panel_key: "internal_services",
    subject_types: ["dept"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["program_ftes"],
      get_title: () => text_maker("internal_service_panel_title"),
      calculate: () => true,
      render: (props) => <InternalServicesContainer {...props} />,
    }),
  });
