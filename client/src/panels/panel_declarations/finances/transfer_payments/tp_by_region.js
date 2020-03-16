import text from './tp_by_region.yaml';

import { Fragment } from 'react';

import {
  formats,
  run_template,
  declare_panel,
  year_templates,
  businessConstants,
  create_text_maker_component,
  StdPanel,
  Col,
  declarative_charts,
} from "../../shared.js";

import { Canada } from '../../../../charts/canada/index.js';
import { SpinnerWrapper, TabbedContent } from '../../../../components/index.js';
import { get_static_url, make_request } from '../../../../request_utils.js';

const { std_years } = year_templates;

const formatter = formats["compact2_raw"];

const { text_maker, TM } = create_text_maker_component(text);
const { provinces, provinces_with_article } = businessConstants;
const { A11YTable } = declarative_charts;


const load_population_data = () => make_request( get_static_url(`csv/canadian_population_estimates_by_province.csv`) )
  .then(
    (csv_string) => _.chain(csv_string)
      .trim()
      .thru( d3.csvParseRows )
      .tail()
      .map( ([prov_code, ...values]) => [prov_code, _.map(values, _.toInteger)] )
      .fromPairs()
      .value()
  );


const group_prov_data_by_year = (data_by_prov) => _.chain(data_by_prov)
  .map( (values, prov_code) => _.map(values, (value) => [prov_code, value]) )
  .unzip()
  .map( _.fromPairs )
  .value();

const get_common_text_args = (transfer_payment_data) => {

};

const get_color_scale = (data) => _.chain(data)
  .last()
  .values()
  .max()
  .thru(
    (last_year_max) => d3.scaleLinear()
      .domain([0, last_year_max])
      .range([0.2, 1])
  )
  .value();
const TransferPaymentsByRegionGraph = ({data}) => (
  <Canada
    graph_args={{
      data,
      color_scale: get_color_scale(data),
      years: std_years,
      formatter: formatter,
    }}
  />
);


const format_data_for_a11y_table = (data) => _.chain(data)
  .flatMap( _.keys )
  .uniq()
  .map( (prov_code) => {
    const formatted_data = _.map(
      data,
      (row) => formats["compact2_written_raw"](row[prov_code] || 0)
    );
  
    return {
      label: provinces[prov_code].text,
      data: formatted_data,
    };
  } )
  .filter('data')
  .value();
const TransferPaymentsByRegionA11yTable = ({data}) => (
  <A11YTable
    label_col_header={ text_maker('geo_region') }
    data_col_headers={ _.map(std_years, run_template) }
    data={ format_data_for_a11y_table(data) }
  />
);

const TransferPaymentsByRegionContent = ({data}) => !window.is_a11y_mode ?
  <TransferPaymentsByRegionGraph
    data={data}
  /> :
  <TransferPaymentsByRegionA11yTable
    data={data}
  />;


class TPMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      population_data: {},
    };
  }
  componentDidMount(){
    load_population_data()
      .then( 
        (population_data) => this.setState({
          loading: false,
          population_data,
        })
      );
  }
  render(){
    const { calculations, footnotes, sources } = this.props;
    const { loading, population_data } = this.state;

    if (loading) {
      return (
        <div style = {{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"sub_route"} />
        </div>
      );
    } else {
      const {
        subject,
        panel_args: {
          table: transfer_payments_table,
        },
      } = calculations;

      const transfer_payments_by_prov = transfer_payments_table.prov_code(
        std_years,
        subject.level === 'dept' && subject.id
      );
      const per_capita_by_prov = _.chain(transfer_payments_by_prov)
        .omitBy( (values, prov_code) => _.isUndefined(population_data[prov_code]) )
        .mapValues(
          (transfer_payment_values, prov_code) => _.chain(transfer_payment_values)
            .zipWith(
              population_data[prov_code],
              (transfer_payment, population) => transfer_payment/population
            )
            .value()
        )
        .value();

      const transfer_payment_data = group_prov_data_by_year(transfer_payments_by_prov);
      const per_capita_data = group_prov_data_by_year(per_capita_by_prov);
      
      const common_text_args = get_common_text_args(transfer_payment_data);

      //REGULAR TP VERSION
      const current_year_data_tp = _.last(transfer_payment_data);
      const largest_prov_tp = _.chain(current_year_data_tp)
        .keys()
        .maxBy( (prov) => current_year_data_tp[prov] )
        .value();
      const total_sum_tp = _.reduce(
        current_year_data_tp,
        (sum, value) => sum += value,
        0
      );
      const percent_of_total_tp = current_year_data_tp[largest_prov_tp] / total_sum_tp;
      const text_args_tp = {
        subject,
        largest_prov: provinces_with_article[largest_prov_tp].text,
        largest_amount: formatter(current_year_data_tp[largest_prov_tp]),
        total_sum: formatter(total_sum_tp),
        percent_of_total: formats["percentage1_raw"](percent_of_total_tp),
        show_per_capita: false,
      };

      const should_per_capita_tab_be_disabled = _.every(per_capita_data, _.isEmpty);
      
      //TP PER CAPITA VERSION
      const current_year_data_tppc = _.last(per_capita_data);

      const largest_prov_tppc = _.chain(current_year_data_tppc)
        .keys()
        .maxBy( (prov) => current_year_data_tppc[prov] )
        .value();
      const text_args_tppc = {
        subject,
        largest_prov: provinces_with_article[largest_prov_tppc].text,
        largest_amount: formatter(current_year_data_tp[largest_prov_tppc]),
        largest_per_capita: formatter(current_year_data_tppc[largest_prov_tppc]),
        total_sum: formatter(total_sum_tp),
        percent_of_total: formats["percentage1_raw"](percent_of_total_tp),
        show_per_capita: true,
      };

      return (
        <StdPanel
          title={text_maker("tp_by_region_title")}
          {...{ footnotes, sources }}
        >
          <Col size={12} isText>
            <TM k="tp_by_region_text" args={text_args_tp} />
          </Col>
          <Col size={12} isGraph>
            <TabbedContent 
              tab_keys={["transfer_payments", "transfer_payments_per_capita"]}
              disabled_tabs={_.compact([should_per_capita_tab_be_disabled && "transfer_payments_per_capita"])}
              disabled_message={text_maker("tp_no_data_hover_label")}
              tab_labels={{
                transfer_payments: text_maker("transfer_payments"),
                transfer_payments_per_capita: text_maker("transfer_payments_per_capita"),
              }}
              tab_pane_contents={{
                transfer_payments: (
                  <TransferPaymentsByRegionContent
                    data={transfer_payment_data}
                  />
                ), 
                transfer_payments_per_capita: (
                  <TransferPaymentsByRegionContent
                    data={per_capita_data}
                  />
                ),
              }}
            />
          </Col>
        </StdPanel>
      );
    }
  }
}


export const declare_tp_by_region_panel = () => declare_panel({
  panel_key: "tp_by_region",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ['orgTransferPaymentsRegion'],
    calculate: function (subject, info) {
      const { orgTransferPaymentsRegion } = this.tables;

      if ( subject.level === 'dept' && !_.has(orgTransferPaymentsRegion.depts , subject.id) ){
        return false;
      }

      return { table: orgTransferPaymentsRegion };
    },
    render: ({calculations, footnotes, sources}) => (
      <TPMap
        calculations={calculations}
        footnotes={footnotes}
        sources={sources}
      />
    ),
  }),
});