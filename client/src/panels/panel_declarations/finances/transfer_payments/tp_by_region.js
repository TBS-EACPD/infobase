import text from './tp_by_region.yaml';
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


const loadPopulation = () => {
  const parse_csv_string = csv_string => _.tail( d3.csvParseRows( _.trim(csv_string) ) );
  
  return make_request( get_static_url(`csv/canadian_population_estimates_by_province.csv`) )
    .then( csv_string => parse_csv_string(csv_string) )
    .then((population_data) =>
      _.chain(population_data)
        .keyBy(_.first)
        .mapValues(row => _.chain(row)
          .tail()
          .map(value => parseInt(value))
          .value()
        )
        .value()
    );
};


const prepare_data_for_a11y_table = (data) => _.chain(data)
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


class TPMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      population: {},
    };
  }
  componentDidMount(){
    loadPopulation()
      .then( 
        (transformed) => this.setState({
          loading: false,
          population: transformed,
        })
      );
  }
  render(){
    const { calculations, footnotes, sources } = this.props;
    const { loading, population } = this.state;

    if (loading) {
      return (
        <div style = {{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"sub_route"} />
        </div>);
    } else {
      const tp_table = calculations.panel_args.table;

      const get_subject_data_for_year = (year) => tp_table.prov_code(
        year,
        calculations.subject.level === 'dept' && calculations.subject.id
      );

      const data_tp = std_years.map(get_subject_data_for_year);
      const data_tppc = std_years.map((year, i) => {
        const single_year_tp_data = get_subject_data_for_year(year);
        return _.chain( _.keys(single_year_tp_data) )
          .pullAll(["na", "abroad"])
          .map((prov) => {
            const in_year_prov_transfer_payments = single_year_tp_data[prov];
            const in_year_prov_population = population[prov][i];
            return [
              prov,
              in_year_prov_transfer_payments/in_year_prov_population,
            ];
          })
          .fromPairs()
          .value();
      });
      
      //REGULAR TP VERSION
      const current_year_data_tp = _.last(data_tp);
      const max_tp = _.chain(data_tp)
        .last()
        .values()
        .max()
        .value();
      const color_scale_tp = d3.scaleLinear()
        .domain([0, max_tp])
        .range([0.2, 1]);
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
        largest_prov: provinces_with_article[largest_prov_tp].text,
        largest_amount: formatter(current_year_data_tp[largest_prov_tp]),
        total_sum: formatter(total_sum_tp),
        percent_of_total: formats["percentage1_raw"](percent_of_total_tp),
        subject: calculations.subject,
        show_per_capita: false,
      };

      const should_per_capita_tab_be_disabled = _.every(data_tppc, _.isEmpty);
      
      //TP PER CAPITA VERSION
      const current_year_data_tppc = _.last(data_tppc);
      
      const max_tppc = _.chain(data_tppc)
        .last()
        .values()
        .max()
        .value();
      const color_scale_tppc = d3.scaleLinear()
        .domain([0, max_tppc])
        .range([0.2, 1]);

      const largest_prov_tppc = _.chain(current_year_data_tppc)
        .keys()
        .maxBy( (prov) => current_year_data_tppc[prov] )
        .value();
      const text_args_tppc = {
        largest_prov: provinces_with_article[largest_prov_tppc].text,
        largest_amount: formatter(current_year_data_tp[largest_prov_tppc]),
        largest_per_capita: formatter(current_year_data_tppc[largest_prov_tppc]),
        total_sum: formatter(total_sum_tp),
        percent_of_total: formats["percentage1_raw"](percent_of_total_tp),
        subject: calculations.subject,
        show_per_capita: true,
      };

      return (
        <StdPanel
          title={text_maker("tp_by_region_title")}
          {...{ footnotes, sources }}
        >
          <Col size={12} isText>
            <TabbedContent 
              tab_keys={["tp", "tp_per_capita"]}
              disabled_tabs={_.compact([should_per_capita_tab_be_disabled && "tp_per_capita"])}
              disabled_message={text_maker("tp_no_data_hover_label")}
              tab_labels={{
                tp: text_maker("show_tp"),
                tp_per_capita: text_maker("show_tp_per_capita"),
              }}
              tab_pane_contents={{
                tp: (
                  <div id={"tp_tab_pane"}>
                    <TM k="tp_by_region_text" args={text_args_tp} />
                    {!window.is_a11y_mode && 
                      <Canada
                        graph_args={{
                          data: data_tp,
                          color_scale: color_scale_tp,
                          years: std_years,
                          formatter: formatter,
                        }}
                      />
                    }
                    <div className='clearfix'></div>
                  </div>
                ), 
                tp_per_capita: (
                  <div id={"tp_per_capita_tab_pane"}>
                    <TM k="tp_by_region_text" args={text_args_tppc} />
                    {!window.is_a11y_mode && 
                      <Canada
                        graph_args={{
                          data: data_tppc,
                          color_scale: color_scale_tppc,
                          years: std_years,
                          formatter: formatter,
                        }}
                      />
                    }
                    <div className='clearfix'></div>
                  </div>
                ),
              }}
            />
          </Col>
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("tp_a11y_table_title")}
                data_col_headers = {_.map( std_years, y => run_template(y) )}
                data = { prepare_data_for_a11y_table(data_tp) }
              />
              <A11YTable
                label_col_header = {text_maker("tp_pc_a11y_table_title")}
                data_col_headers = {_.map( std_years, y => run_template(y) )}
                data = { prepare_data_for_a11y_table(data_tppc) }
              />
            </Col>
          }
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