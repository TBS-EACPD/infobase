import { TM } from './intro_graph_text_provider.js';
import { PanelGraph, util_components } from "../shared";

const { KeyConceptList } = util_components;

new PanelGraph({
  level: 'tag',
  key: "m2m_warning",
  footnotes: false,
  calculate(subject){
    return subject.is_m2m;
  },

  render: () => (
    <div className='bs-callout bs-callout-danger'>
      <KeyConceptList 
        question_answer_pairs={
          _.map( 
            [
              "MtoM_tag_warning_reporting_level",
              "MtoM_tag_warning_resource_splitting",
              "MtoM_tag_warning_double_counting",
            ], 
            key => [
              <TM key={key+"_q"} k={key+"_q"} />, 
              <TM key={key+"_a"} k={key+"_a"} />,
            ] 
          )
        }
      />
    </div>
  ),
});

