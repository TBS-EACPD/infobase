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

_.each(['dept','program','crso'], level => {
  new PanelGraph({
    depends_on: ['programSpending', 'programFtes'],
    info_deps: level === 'crso' ? ['programSpending_crso_info','programFtes_crso_info'] : [],
    key: 'drr_planned_actual',
    //used as as a fail mechanism. If result counts aren't present, bail
    requires_result_counts: true,
    level,
    title: "drr_planned_actual_title",
    calculate(subject, info){
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
      if(!counts || counts.drr17_total < 1){
        return false;
      }

      const { programSpending, programFtes } = this.tables;
      const spend_q = programSpending.q(subject);
      const fte_q = programFtes.q(subject);

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
      const { graph_args, subject, info } = calculations;
      
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
        <TextPanel title={text_maker("drr_planned_actual_title")} footnotes={footnotes}>
          <TM 
            k={ `${subject.level}_drr_planned_actual_text` }
            args={{
              ...graph_args,
              subject,
              crso_prg_num: subject.level === "crso" && _.max([info.crso_fte_prg_num, info.crso_exp_prg_num]),
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
        </TextPanel>
      );

    },
  });
});
