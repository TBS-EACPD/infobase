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
import { RadioButtons, SlideToggle, SpinnerWrapper, TabbedControls, TabbedContent } from '../../../../components/index.js';
import { get_static_url, make_request } from '../../../../request_utils.js';

const { std_years } = year_templates;

const formatter = formats["compact2_raw"];

const { text_maker, TM } = create_text_maker_component(text);
const { provinces, provinces_with_article } = businessConstants;
const { A11YTable } = declarative_charts;


function loadPopulation(){
  const parse_csv_string = csv_string => _.tail( d3.csvParseRows( _.trim(csv_string) ) );
  
  return make_request( get_static_url(`csv/population.csv`) )
    .then( csv_string => parse_csv_string(csv_string) )
    .then(function(population_data) {
      const population_values_by_prov_code = 
      _.chain(population_data)
        .keyBy(_.first)
        .mapValues(row => _.chain(row)
          .tail()
          .map(value => parseInt(value))
          .value()
        )
        .value();
    
      return population_values_by_prov_code;
    }
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
      show_per_capita: false,
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
    const { show_per_capita, loading, population } = this.state;

    if (loading) {
      return (
        <div style = {{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"sub_route"} />
        </div>);
    } else {
      const { tables } = calculations.panel_args;
      const { tp } = tables;

      const changeState = () => {
        this.setState({ show_per_capita: !show_per_capita });
      };

      const get_subject_data_for_year = (year) => tp.prov_code(
        year,
        calculations.subject.level === 'dept' && calculations.subject.id
      );

      //generating both data sets, as a11y table will need both later anyways
      const tp_data = std_years.map(get_subject_data_for_year);
      const tp_pc_data = std_years.map((year, i) => {
        const single_year_tp_data = get_subject_data_for_year(year);
        const result = _.chain(
          _.keys(single_year_tp_data))
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
        return result;
      });
      
      const data_using = (show_per_capita) ? tp_pc_data : tp_data;

      const current_year_data = _.last(data_using);
      
      //organize data for colour scale
      const max = _.chain(data_using)
        .last()
        .values()
        .max()
        .value();
      const color_scale = d3.scaleLinear()
        .domain([0, max])
        .range([0.2, 1]);

      const largest_prov = _.chain(current_year_data)
        .keys()
        .maxBy( (prov) => current_year_data[prov] )
        .value();
      const total_sum = _.reduce(
        current_year_data,
        (sum, value) => sum += value,
        0
      );
      const percent_of_total = current_year_data[largest_prov] / total_sum;
      const text_args = {
        largest_prov: provinces_with_article[largest_prov].text,
        total_sum: formatter(total_sum),
        percent_of_total: formats["percentage1_raw"](percent_of_total),
        subject: calculations.subject,
        show_per_capita: show_per_capita,
      };


      return (
        <StdPanel
          title={text_maker("tp_by_region_title")}
          {...{ footnotes, sources }}
        >
          <Col size={12} isText>
            <SlideToggle
              onSelect={changeState}
              name={text_maker("per_capita_button_title")}
            />
            
            <div className="centerer">
              <RadioButtons
                options={[
                  {
                    id: "tp",
                    //active: this.setState({ show_per_capita: !show_per_capita }),
                    display: <TM k="show_tp" />,
                  },
                  {
                    id: "tp_per_capita",
                    //active: this.setState({ show_per_capita: !show_per_capita }),
                    display: <TM k="show_tp_per_capita" />,
                  },
                ]}
                //onChange={ id => history.push(`/compare_estimates/${id}`) }
                //onChange={(event) => onSelect(event.target.value)}
                //onChange={this.setState({ show_per_capita: !show_per_capita })}
              />
            </div>
          
            {/* TODO replace slide toggle with switching panel
            
            <TabbedControls
              tab_callback={ (year) => this.setState({loading: true, selected_year: year}) }
              tab_options={
                _.map(
                  treatAsProgram(subject) ? years_with_data : budget_years,
                  (year) => ({
                    key: year,
                    label: `${text_maker("budget_name_header")} ${year}`,
                    is_open: selected_year === year,
                    is_disabled: !(_.includes(years_with_data, year)),
                  })
                )
              }
            /> */}
            
            <TM k="tp_by_region_text" args={text_args} />
          </Col>

          {!window.is_a11y_mode &&
            <Col size={12} isGraph>
              <Canada
                graph_args={{
                  data: data_using,
                  color_scale: color_scale,
                  years: std_years,
                  formatter: formatter,
                }}
              />
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("tp_a11y_table_title")}
                data_col_headers = {_.map( std_years, y => run_template(y) )}
                data = { prepare_data_for_a11y_table(tp_data) }
              />
              <A11YTable
                label_col_header = {text_maker("tp_pc_a11y_table_title")}
                data_col_headers = {_.map( std_years, y => run_template(y) )}
                data = { prepare_data_for_a11y_table(tp_pc_data) }
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

      return {
        tables: {
          tp: orgTransferPaymentsRegion,
        },
      };
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