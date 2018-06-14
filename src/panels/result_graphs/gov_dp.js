import text from './gov_dp_text.yaml';

import {
  Subject,
  create_text_maker,
  PanelGraph,
  Panel,
  TM as StdTM,
} from "../shared";

import {
  link_to_results_infograph,
  ResultCounts,
} from './results_common.js';

import { QuadrantDefList } from './components.js';

const text_maker = create_text_maker(text);
const TM = props => <StdTM tmf={text_maker} {...props} />;

const { Dept, Program } = Subject;

class ResultsIntroPanel extends React.Component {
  render(){
    const { 
      num_DRF_CRs,
      num_DRF_progs,
      num_DRF_results,
      num_DRF_indicators,
      num_PAA_results,
      num_PAA_SOs,
      num_PAA_indicators,
      num_PAA_progs,
      new_wave_examples,
    }  = this.props;

    return (
      <div className="medium_panel_text">
        <div className="mrgn-bttm-lg">
          <TM k="gov_results_intro_text" />
        </div>
        <section className="new-policy-section">
          <header>
            <div className="h4"> <TM k="gov_drf_title" /> </div>
          </header>
          <div className="row">
            <div className="col-md-6">
              <div className="mrgn-bttm-lg">
                <QuadrantDefList 
                  defs={[
                    {key: text_maker('core_resps'), val: num_DRF_CRs},
                    {key: Program.plural, val: num_DRF_progs},
                    {key: text_maker('results'), val: num_DRF_results},
                    {key: text_maker('indicators'), val: num_DRF_indicators},
                  ]}
                />
              </div>
            </div>
            <div className="col-md-6">
              <section>
                <p> <TM k="gov_drf_text" /> </p>
                <ul>
                  {_.map( new_wave_examples, dept => 
                    <li key={dept.name}> 
                      <a href={link_to_results_infograph(dept, 'results')} >
                        { dept.name } 
                      </a> 
                    </li> 
                  )}
                </ul>
              </section>
            </div>
            <div className="clearfix" />
          </div>
        </section>
        <div 
          style={{
            borderTop: "solid 1px #ccc",
          }}
        />
        <section className="old-policy-section">
          <header>
            <div className="h4"> <TM k="gov_paa_title" /> </div>
          </header>
          <div className="row">
            <div className="col-md-6">
              <div className="mrgn-bttm-lg">
                <QuadrantDefList 
                  defs={[
                    {key: text_maker('strategic_outcomes'), val: num_PAA_SOs },
                    {key: Program.plural, val: num_PAA_progs },
                    {key: text_maker('results'), val: num_PAA_results},
                    {key: text_maker('indicators'), val: num_PAA_indicators},
                  ]}
                />
              </div>
            </div>
            <div className="col-md-6">
              <TM k="gov_paa_text" />
            </div>
            <div className="clearfix" />
          </div>
        </section>
      </div>
    );
  }
}

new PanelGraph({
  level: 'gov',
  requires_result_counts: true,
  key: "gov_dp",
  calculate: _.constant(true),

  render({calculations}){
    const { subject } = calculations;

    const { fw: DRF_depts, sw: PAA_depts }  = _.groupBy(Dept.get_all(), 'dp_status'); 

    const CRs = _.chain(DRF_depts)
      .map(d => d.crsos)
      .flatten()
      .reject('dead_so') 
      .value();

    const DRF_progs = _.chain(CRs)
      .map(cr => cr.programs)
      .flatten()
      .reject('dead_program') 
      .value();

    const counts_by_dp_status = _.chain(ResultCounts.get_all_dept_counts())
      .map( ({ id, dp17_results, dp17_indicators }) => {
        const { dp_status }  = Dept.lookup(id);
        return { 
          dp_status, 
          results: dp17_results,
          indicators: dp17_indicators,
        };
      })
      .groupBy('dp_status')
      .map( (group, dp_status) => [
        dp_status,
        {
          results: d3.sum(_.map(group, 'results') ),
          indicators: d3.sum(_.map(group, 'indicators') ),
        },
      ])
      .fromPairs()
      .value();

    const {
      sw: { 
        results: num_PAA_results,
        indicators: num_PAA_indicators,
      }, 
      fw: {
        results: num_DRF_results,
        indicators: num_DRF_indicators,
      },
    } = counts_by_dp_status;


    const PAA_SOs = _.chain(PAA_depts)
      .map(d => d.crsos)
      .flatten()
      .reject('dead_so')
      .value();

    const PAA_progs = _.chain(PAA_SOs)
      .map(so => so.programs)
      .flatten()
      .reject('dead_program')
      .value();

    const props = {
      num_DRF_depts : DRF_depts.length,
      num_DRF_CRs : CRs.length,
      num_DRF_progs : DRF_progs.length,
      num_DRF_results,
      num_DRF_indicators,

      num_PAA_depts: PAA_depts.length,
      num_PAA_SOs: PAA_SOs.length,
      num_PAA_results,
      num_PAA_indicators,
      num_PAA_progs: PAA_progs.length,

      subject,
      new_wave_examples: DRF_depts,
      second_wave_examples : _.map([128,133,127,295 ], id => Dept.lookup(id) ),
    };

    return <Panel title={text_maker("gov_dp_summary_title")}>
      <div>
        <ResultsIntroPanel  {...props} />
      </div>
    </Panel>;
  },
});
