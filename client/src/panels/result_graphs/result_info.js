import {
  get_source_links, 
  declare_panel,
  TextPanel,
  general_utils,
  util_components,
} from '../shared.js';
import {
  Indicator,
} from '../../models/results.js';
import { text_maker } from './intro_graph_text_provider.js';
const { LabeledTombstone } = util_components;


export const declare_results_table_panel = () => declare_panel({
  panel_key: "result_info",
  levels: ["indicator"],
  source: (subject) => get_source_links(["DP","DRR"]),
  panel_config_func: (level, panel_key) => ({
    calculate: (subject) => {
      const result_data = Indicator.lookup(subject.id);
      if (!result_data.id) return false;
      return { result_data };
    },
    render({calculations}){
      const { subject, result_data } = calculations;
  
      const labels_and_items = _.chain(
        [
          ["name", "asdfasdf"],
          ["status", "wtf"],
        ]
      )
        .map( ([label_key, item]) => [
          text_maker(label_key),
          item,
        ])
        .filter( ([label, item]) => item )
        .value();
  
      return (
        <TextPanel title={text_maker(`profile`)}>
          <LabeledTombstone labels_and_items={labels_and_items} />
        </TextPanel>
      );
    },
  }),
});
