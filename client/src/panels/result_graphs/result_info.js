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
//import { text_maker } from './intro_graph_text_provider.js';
const { LabeledTombstone } = util_components;


export const declare_results_table_panel = () => declare_panel({
  panel_key: "result_info",
  levels: ["indicator"],
  source: (subject) => get_source_links(["DP","DRR"]),
  panel_config_func: (level, panel_key) => ({
    calculate: (subject) => {
      return subject;
    },
    render({calculations, graph_options}){
      const { subject } = calculations;
      debugger;
  
      const labels_and_items = _.chain(
        [
          ["name", "asdfasdf"],
          ["status", "wtf"],
        ]
      )
        .map( ([label_key, item]) => [
          //text_maker(label_key),
          item,
        ])
        .filter( ([label, item]) => item )
        .value();
  
      return (
        <TextPanel title={"asdf"}>{/*text_maker(`profile`)}>*/}
          <LabeledTombstone labels_and_items={labels_and_items} />
        </TextPanel>
      );
    },
  }),
});
