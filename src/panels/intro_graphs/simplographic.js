import simplographic_text from './simplographic.yaml';
import { 
  Subject, 
  PanelGraph, 
  util_components, 
  Panel,
} from '../shared';
import { infograph_href_template, rpb_link } from '../../link_utils.js';
import { ResultCounts } from '../../models/results.js';
import { get_static_url } from '../../core/request_utils.js';

const { Gov, Dept } = Subject;
const { create_text_maker_component} = util_components;

const { TM } = create_text_maker_component(simplographic_text);

new PanelGraph({
  level: 'gov',
  key : "simplographic",
  footnotes: false,
  requires_result_counts: true,

  depends_on : [ 
    'table4', 
    'table10', 
  ],

  info_deps: [ 
    'table10_gov_info',
  ],


  calculate(dept,info){
    const {table4, table10} = this.tables;
    const gov_exp_pa_last_year = table4.q().sum('{{pa_last_year}}exp');

    const federal_institutions = _.chain(Dept.get_all())
      //HACKY: "Active" is coming from an igoc column, we're taking advantage of "Active" being the same in Englihs and french.
      .filter('inst_form.parent_form.parent_form')
      .filter(org => org.inst_form.parent_form.parent_form.id === 'fed_int_gp')
      .reject('end_yr')
      .reject({unique_id:"999"})
      .value()

    const ministries = _.chain(federal_institutions)  
      .map(org => org.ministry)
      .uniqBy()
      .value()



    //People calcs
    const employee_by_prov = table10.prov_code("{{ppl_last_year}}", Gov);
    const total_employees = _.chain(employee_by_prov).values().sum().value();
    const ncr_employees = employee_by_prov.ncr;
    const empl_count_ncr_ratio =  ncr_employees/total_employees;




    const gov_counts = ResultCounts.get_gov_counts();

    const col  = '{{pa_last_year}}exp';
    const largest_items = _.chain(table4.data)
      .sortBy(col)
      .takeRight(3)
      .reverse()
      .map(row => ({
        subject: Dept.lookup(row.dept),
        desc: row.desc,
        amt : row[col],
      }))
      .value();

    const t9_link = rpb_link({ table: 'table9' });
    const t10_link = rpb_link({ 
      table: 'table10', 
      preferDeptBreakout: false,
    });
    const t4_link = rpb_link({ table: 'table4' });

    const results_link = infograph_href_template(Gov, 'results');

    const { 
      drr16_indicators_future_success, 
      drr16_indicators_past_success, 
      drr16_total: num_indicators,
      drr16_results: num_results,
    } = gov_counts;

    const num_ontrack_or_met = drr16_indicators_future_success + drr16_indicators_past_success;
    const pct_ontrack_or_met = num_ontrack_or_met/num_indicators;


    return {
      largest_items,
      gov_exp_pa_last_year,
      empl_count_total: total_employees,
      empl_count_ncr_ratio,
      num_federal_inst: federal_institutions.length,
      num_ministries: ministries.length,

      num_results,
      num_indicators,
      num_ontrack_or_met,
      pct_ontrack_or_met,

      t4_link,
      t9_link,
      t10_link,
      results_link,
      ...info,
    };
  },

  render({calculations}){
    const { graph_args: big_info } = calculations;
    const Row = props => {
      const this_row_props =  {className : "grid-row canada-intro-grid", style:{borderTop : 0,padding: "15px 0px",marginLeft:"-50px",marginRight:"-15px"}}
      if (props.top_border){
        this_row_props.style.borderTop="#";
      }
      return <div {...this_row_props}>
        <div className='lg-grid-panel20' style={{flexDirection:'column', justifyContent: "center"}}>
          <div className="inner-grid">
            <img 
              role="presentation"
              aria-hidden={true}
              src={get_static_url(`svg/${props.img_src}`)} 
              width="150" height="150" 
              style={{
                alignSelf: "center",
                maxWidth:"100%", 
              }}
            />
          </div>
        </div>
        <section className='lg-grid-panel70' style={{flexDirection: 'column'}}>
          <header className="h2 mrgn-tp-sm" style={{textAlign: window.is_mobile() ? 'center' : 'inherit'}}> <TM k={props.title_key}/> </header>
          <TM el="p" k={props.text_key}  args={big_info} />
        </section>
      </div>;
    };

    return (
      <Panel>
        <div className="medium_panel_text">
          <Row top_border img_src="money.svg" title_key="simplographic_spending_title" text_key="simplographic_spending_text"/> 
          <Row img_src="employees.svg" title_key="simplographic_people_title" text_key="simplographic_people_text"/> 
          <Row img_src="graph.svg" title_key="simplographic_struct_title" text_key="simplographic_struct_text"/> 
          <Row img_src="check.svg" title_key="simplographic_results_title" text_key="simplographic_results_text"/> 
        </div>
      </Panel>
    );
  },
});

