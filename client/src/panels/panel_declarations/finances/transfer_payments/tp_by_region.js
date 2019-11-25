import text from './tp_by_region.yaml';
import {
  formats,
  run_template,
  declare_panel,
  years,
  businessConstants,
  create_text_maker_component,
  StdPanel,
  Col,
  declarative_charts,
} from "../shared";
import { ExtendedCanada } from '../../../../charts/extended_canada.js';

const { std_years } = years;
const context_years = std_years;
const formatter = formats["compact2_raw"];
const includeNcr = false;

const { text_maker, TM } = create_text_maker_component(text);
const { provinces } = businessConstants;
const { A11YTable } = declarative_charts;

const calculate_common = (years_by_province) => {
  const max = d3.max(d3.values(_.last(years_by_province)));
  const color_scale = d3.scaleLinear()
    .domain([0,max])
    .range([0.2,1]);
  return {
    years_by_province,
    color_scale,
    context_years,
    formatter,
    includeNcr,
  };
};

const calculate_funcs_by_level = {
  gov: function(){
    const { orgTransferPaymentsRegion } = this.tables;
    return calculate_common( std_years.map( year => orgTransferPaymentsRegion.prov_code(year, false) ) );
  },
  dept: function(subject){
    const { orgTransferPaymentsRegion } = this.tables;
    return calculate_common( std_years.map( year => orgTransferPaymentsRegion.prov_code(year, subject.unique_id) ) );
  },
};

const prepare_data_for_a11y_table = (years_by_province) => {
  const total_tp = _.chain(years_by_province)
    .map( year_by_province => d3.sum( _.values(year_by_province) ) )
    .reduce( (sum, value) => sum + value, 0)
    .value();
  
  return _.chain(provinces)
    .map((province, prov_code) => {
      if(prov_code!="onlessncr" && prov_code!="qclessncr" && prov_code!="ncr"){
        const yearly_tp = _.map(years_by_province, (year_by_province) => year_by_province[prov_code]);
        const formatted_yearly_tp = _.map(years_by_province, (year_by_province) => formats["compact2_written_raw"](year_by_province[prov_code]));
        const five_year_avg_share = d3.sum(yearly_tp)/total_tp;
        const formatted_avg_share = formats["percentage1_raw"](five_year_avg_share);

        return {
          label: province.text,
          data: [...formatted_yearly_tp, formatted_avg_share],
        };
      }
    })
    .filter((data) => !_.isUndefined(data))
    .value();
};

export const declare_tp_by_region_panel = () => declare_panel({
  panel_key: "tp_by_region",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ['orgTransferPaymentsRegion'],
    calculate: calculate_funcs_by_level[level],
    
    render(render_args){
      const {
        calculations,
        footnotes,
        sources,
        level,
      } = render_args;
  
      const { graph_args } = calculations;
      const { years_by_province } = graph_args;

      return (
        <StdPanel
          title={text_maker("tp_by_region_title")}
        >
          <Col size={12} isText>
            {text_maker("tp_by_region_text")}
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph>
              <ExtendedCanada
                graph_args={graph_args}
              />
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("prov")}
                data_col_headers = {[..._.map( context_years, y => run_template(y) ), text_maker("five_year_percent_header")]}
                data = { prepare_data_for_a11y_table(years_by_province) }
              />
            </Col>
          }
        </StdPanel>
      );
        
    },
  }),
});