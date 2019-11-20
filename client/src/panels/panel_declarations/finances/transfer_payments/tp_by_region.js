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

//const { text_maker, TM } = create_text_maker_component(text);
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
          title={"hi"}
        >
          <Col size={12} isText>
            sup
          </Col>
          { !window.is_a11y_mode &&
            <Col size={12} isGraph>
              <ExtendedCanada
                graph_args={graph_args}
              />
            </Col>
          }
          { window.is_a11y_mode &&
            true
          }
        </StdPanel>
      );
        
    },
  }),
});