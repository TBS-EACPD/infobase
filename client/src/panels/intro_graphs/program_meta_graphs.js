import { TM } from './intro_graph_text_provider.js';
import { declare_panel } from "../shared";

export const declare_dead_program_warning_panel = () => declare_panel({
  panel_key: "dead_program_warning",
  levels: ['program'],
  panel_config_func: (level, panel_key) => ({
    level,
    key: panel_key,
    footnotes: false,
    calculate: _.property("dead_program"),
    render(){
      return (
        <div 
          className="alert alert-danger alert-no-symbol alert--is-bordered large_panel_text"
          style={{textAlign: "center"}}
        >
          <TM k="dead_program_warning" />
        </div>
      );
    },
  }),
});


export const declare_dead_crso_warning_panel = () => declare_panel({
  panel_key: "dead_crso_warning",
  levels: ['crso'],
  panel_config_func: (level, panel_key) => ({
    level,
    key: panel_key,
    footnotes: false,
    calculate: _.property("dead_so"),
    render(){
      
      return (
        <div 
          className="alert alert-no-symbol alert-danger alert--is-bordered large_panel_text"
          style={{textAlign: "center"}}
        >
          <TM k="dead_crso_warning" />
        </div>
      );
    },
  }),
});