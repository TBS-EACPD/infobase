import { TM } from '../intro/intro_panel_text_provider.js';
import { declare_panel, util_components } from "../shared.js";

const {
  KeyConceptList,
  AlertBanner,
} = util_components;

export const declare_m2m_tag_warning_panel = () => declare_panel({
  panel_key: "m2m_warning",
  levels: ['tag'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate(subject){
      return subject.is_m2m;
    },
  
    render: () => (
      <AlertBanner banner_class="danger">
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
      </AlertBanner>
    ),
  }),
});
