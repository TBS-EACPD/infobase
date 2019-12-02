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
} from "../../shared.js";
import { Canada } from '../../../../charts/canada/index.js';

const { std_years } = years;
const formatter = formats["compact2_raw"];
const includeNcr = false;

const { text_maker } = create_text_maker_component(text);
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
    context_years: std_years,
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

const prepare_data_for_a11y_table = (years_by_province) =>
  _.chain(provinces)
    .map((province, prov_code) => {
      if( !_.includes(["onlessncr", "qclessncr", "ncr"], prov_code)){
        const formatted_yearly_tp = _.map(years_by_province, (year_by_province) => formats["compact2_written_raw"](year_by_province[prov_code]));

        return {
          label: province.text,
          data: formatted_yearly_tp,
        };
      }
    })
    .filter((data) => !_.isUndefined(data))
    .value();

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
      } = render_args;
      const { panel_args } = calculations;
      const { years_by_province } = panel_args;

      return (
        <StdPanel
          title={text_maker("tp_by_region_title")}
          {...{footnotes, sources}}
        >
          <Col size={12} isText>
            {text_maker("tp_by_region_text")}
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph>
              <Canada
                graph_args={panel_args}
              />
            </Col>
          }
          { window.is_a11y_mode &&
            <Col size={12} isGraph>
              <A11YTable
                label_col_header = {text_maker("prov")}
                data_col_headers = {_.map( std_years, y => run_template(y) )}
                data = { prepare_data_for_a11y_table(years_by_province) }
              />
            </Col>
          }
        </StdPanel>
      );
        
    },
  }),
});