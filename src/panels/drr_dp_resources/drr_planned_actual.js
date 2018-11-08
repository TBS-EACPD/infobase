import text from "./drr_planned_actual.yaml";

import {
  PanelGraph,
  FootNote,
  PlannedActualTable,
  create_text_maker_component,
  TextPanel,
} from '../shared.js';

import { ResultCounts } from '../result_graphs/results_common.js';

const { text_maker, TM } = create_text_maker_component(text);

_.each(['dept','program'], level => {
  new PanelGraph({
    depends_on: ['table6', 'table12'],
    key:'drr_planned_actual',
    //used as as a fail mechanism. If result counts aren't present, bail
    requires_result_counts: true,
    level,
    title: "drr_planned_actual_title",
    calculate(subject,info){
      if(subject.level === 'dept'){
        if(!subject.is_rpp_org){
          return false;
        }
      } else if(!subject.dept.is_rpp_org){
        return false;
      } 
  
      let counts;
      if(subject.level === 'dept'){
        counts = ResultCounts.get_dept_counts(subject.acronym);
      } else {
        counts = ResultCounts.get_dept_counts(subject.dept.acronym);
      }
      if(!counts || counts.drr16_total < 1){
        return false;
      }

      const { table6, table12 } = this.tables;
      const spend_q = table6.q(subject);
      const fte_q = table12.q(subject);

      const planned_spend = spend_q.sum("drr_last_year");
      const planned_ftes = fte_q.sum("drr_last_year");

      const actual_spend = spend_q.sum("{{pa_last_year}}exp");
      const actual_ftes = fte_q.sum("{{pa_last_year}}");

  
      //program has been dead before drr_last_year
      if( !_.some([actual_spend, actual_ftes, planned_ftes, planned_spend]) ){
        return false;
      }


      const footnotes = FootNote.get_for_subject(
        subject,
        ['DRR_EXP', 'DRR_FTE']
      );

      return { 
        planned_ftes,
        planned_spend,
        actual_ftes,
        actual_spend,
        diff_spend: actual_spend - planned_spend,
        diff_ftes: actual_ftes - planned_ftes,
        footnotes,
      };

    },

    render({calculations}){
      const { graph_args, subject } = calculations;
      
      const { 
        actual_spend,
        actual_ftes,
        planned_spend,
        planned_ftes,
        diff_ftes,
        diff_spend,
        footnotes,
      } = graph_args;


      return (
        <TextPanel title={text_maker("drr_planned_actual_title")}>
          <TM 
            k={ 
              subject.level === 'dept' ? 
              "dept_drr_planned_actual_text" :
              "program_drr_planned_actual_text"
            }
            args={{...graph_args,
              subject,
            }}
          />
          <PlannedActualTable 
            {...{
              actual_spend,
              actual_ftes,
              planned_spend,
              planned_ftes,
              diff_ftes,
              diff_spend,
            }}
          />
          {!_.isEmpty(footnotes) && 
            <ul>
              {_.map(footnotes, ({text},i) => 
                <li key={i}>
                  <div dangerouslySetInnerHTML={{__html: text}} />
                </li>
              )}
            </ul>
          }
        </TextPanel>
      );

    },
  });
});
