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
import { SlideToggle, SpinnerWrapper } from '../../../../components/index.js';
import { get_static_url, make_request } from '../../../../request_utils.js';
//import { Subject } from './subject.js';

const { std_years } = year_templates;

const formatter = formats["compact2_raw"];

const { text_maker, TM } = create_text_maker_component(text);
const { provinces, provinces_with_article } = businessConstants;
const { A11YTable } = declarative_charts;


//function to load and prepare data, returning a promise
function loadPopulation(){
  const parse_csv_string = csv_string => _.tail( d3.csvParseRows( _.trim(csv_string) ) );

  const load_csv = () => make_request( get_static_url(`csv/population.csv`) )
    .then( csv_string => parse_csv_string(csv_string) );
    
  return load_csv().then(function(loaded) {
    //transforming pop data to be code friendly
    const transformed = _.chain(loaded)
      .keyBy(row => row[0])
      .mapValues(row => _.chain(row)
        .tail()
        .map(value => parseInt(value))
        .value()
      )
      .value();
    //loaded now contains the csv of pop data
    
    return transformed;
    //population from TPMap now contains the csv of pop data
  }
  ); 
};

class TPMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show_per_capita: false, loading: true, population: {} };
  }

  componentDidMount(){
    loadPopulation().then( (transformed) => this.setState({ loading: false, population: transformed }));
  }
  render(){
    const { calculations, footnotes, sources } = this.props;
    const { show_per_capita, loading, population } = this.state;
    if (loading) {
      return (
        <div style = {{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper/>
        </div>);
    } else {
      const { tables } = calculations.panel_args;
      const { tp } = tables;

      //changes how the event is handled for the Slide Toggler
      const changeState = () => {
        this.setState({ show_per_capita: !show_per_capita });
      };

      //set data to right data
      const table_to_use = tp;
      //fix later to show gov or a dept
      const data = (!show_per_capita) ?
        std_years.map((year) => table_to_use.prov_code(year, false /*subject.unique_id*/))
        : 
        //math to apply division to tp data
        std_years.map((year, i) => {
          const single_year_tp_data = table_to_use.prov_code(year, false /*subject.unique_id*/);

          const result = _.chain(_.keys(single_year_tp_data))
            .pullAll(["na", "abroad"])
            .map((prov) => {
              // const top = single_year_tp_data[prov];
              // const bottom = population[prov];
              // const mix = top/bottom[i];
              // debugger;
              return single_year_tp_data[prov]/population[prov][i];
            } )
            .value();
          return result;
        });

      //TODO last step - add department data instead of just gov data
      
      const current_year_data = _.last(data);//find new place to get data from

      //determine colour scale
      const max = d3.max(d3.values(_.last(data)));
      const color_scale = d3.scaleLinear()
        .domain([0, max])
        .range([0.2, 1]);

      const largest_prov = _.chain(current_year_data)
        .keys()
        .maxBy((prov) => current_year_data[prov])
        .value();
      const total_sum =
        _.reduce(current_year_data,
          (sum, value) => sum += value,
          0);
      const percent_of_total = current_year_data[largest_prov] / total_sum;
      const text_args = {
        largest_prov: provinces[largest_prov].text,
        total_sum: formatter(total_sum),
        percent_of_total: formats["percentage1_raw"](percent_of_total),
        subject: calculations.subject,
      };


      return (
        <StdPanel
          title={text_maker("tp_by_region_title")}
          {...{ footnotes, sources }}
        >
          <Col size={12} isText>
            <TM k="tp_by_region_text" args={text_args} />
          </Col>
          {!window.is_a11y_mode &&
            <Col size={12} isGraph>
              <SlideToggle
                onSelect={changeState}
                name="Toggle Show Per Capita"
              />
              <Canada
                graph_args={{
                  data: data,
                  color_scale: color_scale,
                  years: std_years,
                  formatter: formatter,
                }}
              />
            </Col>
          }
          {/* { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("prov")}
                data_col_headers = {_.map( std_years, y => run_template(y) )}// TODO - change this to read first 5 headers then next 5_per_capita
                data = { prepare_data_for_a11y_table(data) }
              />
              <A11YTable
                label_col_header = {text_maker("prov")}
                data_col_headers = {_.map( std_years, y => run_template(y) )}// TODO - change this to read first 5 headers then next 5_per_capita
                data = { prepare_data_for_a11y_table(data) }
              />
            </Col>
          } */}
        </StdPanel>
      );
    }
  }
}


const prepare_data_for_a11y_table = (data) =>
  _.chain(provinces)
    .map((province, prov_code) => {
      if (!_.includes(["onlessncr", "qclessncr", "ncr"], prov_code)) {
        const formatted_yearly_tp = _.map(
          data,
          (row) => formats["compact2_written_raw"](row[prov_code])
        );

        return {
          label: province.text,
          data: formatted_yearly_tp,
        };
      }
    })
    .filter((data) => !_.isUndefined(data))
    .value();


//render function
const render_func = (render_args) => {
  const {
    calculations,
    footnotes,
    sources,
  } = render_args;

  return (
    <TPMap
      calculations={calculations}
      footnotes={footnotes}
      sources={sources}
    />
  );
};


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
    render: render_func,
  }),
});