import { Fragment } from "react";

import { Canada } from "../../../../charts/canada/index.js";
import {
  SpinnerWrapper,
  TabbedContent,
  SmartDisplayTable,
} from "../../../../components/index.js";
import { get_static_url, make_request } from "../../../../request_utils.js";
import {
  formats,
  run_template,
  declare_panel,
  year_templates,
  businessConstants,
  create_text_maker_component,
  StdPanel,
  Col,
} from "../../shared.js";

import text from "./tp_by_region.yaml";

const { tp_by_region_years } = year_templates;

const { text_maker, TM } = create_text_maker_component(text);
const { provinces, le_provinces, de_provinces } = businessConstants;

const load_population_data = () =>
  make_request(
    get_static_url(`csv/canadian_population_estimates_by_province.csv`)
  ).then((csv_string) =>
    _.chain(csv_string)
      .trim()
      .thru(d3.csvParseRows)
      .tail()
      .map(([prov_code, ...values]) => [prov_code, _.map(values, _.toInteger)])
      .fromPairs()
      .value()
  );

const group_prov_data_by_year = (data_by_prov) =>
  _.chain(data_by_prov)
    .map((values, prov_code) => _.map(values, (value) => [prov_code, value]))
    .unzip()
    .map(_.fromPairs)
    .value();

const get_text_args = (subject, transfer_payment_data, per_capita_data) => {
  const last_year_data = _.last(transfer_payment_data);
  const last_year_data_per_capita = _.last(per_capita_data);

  const subject_total_value = _.chain(last_year_data)
    .values()
    .reduce((accumulator, value) => accumulator + value, 0)
    .value();

  const [largest_total_prov_code, largest_total_value] = _.chain(last_year_data)
    .toPairs()
    .sortBy(([prov_code, value]) => value)
    .last()
    .value();
  const largest_total_prov = provinces[largest_total_prov_code].text;
  const le_largest_total_prov = le_provinces[largest_total_prov_code].text;
  const de_largest_total_prov = de_provinces[largest_total_prov_code].text;
  const largest_total_percent = largest_total_value / subject_total_value;

  const show_per_capita_data = !_.isEmpty(per_capita_data);
  const [
    largest_per_capita_prov_code,
    largest_per_capita_value,
  ] = show_per_capita_data
    ? _.chain(last_year_data_per_capita)
        .toPairs()
        .sortBy(([prov_code, value]) => value)
        .last()
        .value()
    : [false, false];
  const largest_per_capita_prov =
    show_per_capita_data && provinces[largest_per_capita_prov_code].text;
  const le_largest_per_capita_prov =
    show_per_capita_data && le_provinces[largest_per_capita_prov_code].text;

  const compare_per_capita_to_largest_total =
    show_per_capita_data &&
    !_.includes(
      ["abroad", "na", largest_per_capita_prov_code],
      largest_total_prov_code
    );
  const largest_total_per_capita_value =
    compare_per_capita_to_largest_total &&
    last_year_data_per_capita[largest_total_prov_code];

  return {
    subject,
    is_gov: subject.level === "gov",
    subject_total_value,

    largest_total_prov,
    le_largest_total_prov,
    de_largest_total_prov,
    largest_total_value,
    largest_total_percent,

    show_per_capita_data,
    largest_per_capita_prov,
    le_largest_per_capita_prov,
    largest_per_capita_value,

    compare_per_capita_to_largest_total,
    largest_total_per_capita_value,
  };
};

const get_color_scale = (data) =>
  _.chain(data)
    .last()
    .values()
    .max()
    .thru((last_year_max) =>
      d3.scaleLinear().domain([0, last_year_max]).range([0.2, 1])
    )
    .value();
const TransferPaymentsByRegionGraph = ({ data }) => (
  <Canada
    graph_args={{
      data,
      color_scale: get_color_scale(data),
      years: tp_by_region_years,
      formatter: formats.compact2_raw,
    }}
  />
);

class TPMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      population_data: {},
    };
  }
  componentDidMount() {
    load_population_data().then((population_data) =>
      this.setState({
        loading: false,
        population_data,
      })
    );
  }
  render() {
    const { calculations, footnotes, sources } = this.props;
    const { loading, population_data } = this.state;

    if (loading) {
      return (
        <div
          style={{
            position: "relative",
            height: "80px",
            marginBottom: "-10px",
          }}
        >
          <SpinnerWrapper config_name={"sub_route"} />
        </div>
      );
    } else {
      const {
        subject,
        panel_args: { table: transfer_payments_table },
      } = calculations;

      const transfer_payments_by_prov = transfer_payments_table.prov_code(
        tp_by_region_years,
        subject.level === "dept" && subject.id
      );
      const per_capita_by_prov = _.chain(transfer_payments_by_prov)
        .omitBy((values, prov_code) =>
          _.isUndefined(population_data[prov_code])
        )
        .mapValues((transfer_payment_values, prov_code) =>
          _.chain(transfer_payment_values)
            .zipWith(
              population_data[prov_code],
              (transfer_payment, population) => transfer_payment / population
            )
            .value()
        )
        .value();

      const transfer_payment_data = group_prov_data_by_year(
        transfer_payments_by_prov
      );
      const per_capita_data = group_prov_data_by_year(per_capita_by_prov);
      const format_a11y_data = (data) =>
        _.map(data, (prov_data, prov_code) => ({
          prov: provinces[prov_code].text,
          ..._.chain(tp_by_region_years).zip(prov_data).fromPairs().value(),
        }));

      const get_column_configs = (is_per_capita) => ({
        prov: {
          index: 0,
          is_searchable: true,
          header: text_maker("geo_region"),
        },
        ..._.chain(tp_by_region_years)
          .map((yr, idx) => [
            yr,
            {
              index: idx + 1,
              header: run_template(yr),
              formatter: (value) =>
                is_per_capita
                  ? `${formats.compact1_written_raw(value)} ${text_maker(
                      "per_capita"
                    )}`
                  : formats.compact2_written_raw(value),
            },
          ])
          .fromPairs()
          .value(),
      });

      const text_args = get_text_args(
        subject,
        transfer_payment_data,
        per_capita_data
      );

      return (
        <StdPanel
          title={text_maker("tp_by_region_title")}
          {...{ footnotes, sources }}
        >
          <Col size={12} isText>
            <TM k="tp_by_region_text" args={text_args} />
            {!window.is_a11y_mode && <TM k="tp_by_region_graph_usage" />}
          </Col>
          <Col size={12} isGraph>
            {!window.is_a11y_mode && (
              <TabbedContent
                tab_keys={["transfer_payments", "transfer_payments_per_capita"]}
                disabled_tabs={_.compact([
                  !text_args.show_per_capita_data &&
                    "transfer_payments_per_capita",
                ])}
                disabled_message={text_maker("tp_no_data_hover_label")}
                tab_labels={{
                  transfer_payments: text_maker("transfer_payments"),
                  transfer_payments_per_capita: text_maker(
                    "transfer_payments_per_capita"
                  ),
                }}
                tab_pane_contents={{
                  transfer_payments: (
                    <TransferPaymentsByRegionGraph
                      data={transfer_payment_data}
                    />
                  ),
                  transfer_payments_per_capita: (
                    <TransferPaymentsByRegionGraph data={per_capita_data} />
                  ),
                }}
              />
            )}
            {window.is_a11y_mode && (
              <Fragment>
                <SmartDisplayTable
                  column_configs={get_column_configs(false)}
                  data={format_a11y_data(transfer_payments_by_prov)}
                />
                <SmartDisplayTable
                  column_configs={get_column_configs(true)}
                  data={format_a11y_data(per_capita_by_prov)}
                />
              </Fragment>
            )}
          </Col>
        </StdPanel>
      );
    }
  }
}

export const declare_tp_by_region_panel = () =>
  declare_panel({
    panel_key: "tp_by_region",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgTransferPaymentsRegion"],
      calculate: function (subject) {
        const { orgTransferPaymentsRegion } = this.tables;

        if (
          subject.level === "dept" &&
          !_.has(orgTransferPaymentsRegion.depts, subject.id)
        ) {
          return false;
        }

        return { table: orgTransferPaymentsRegion };
      },
      render: ({ calculations, footnotes, sources }) => (
        <TPMap
          calculations={calculations}
          footnotes={footnotes}
          sources={sources}
        />
      ),
    }),
  });
