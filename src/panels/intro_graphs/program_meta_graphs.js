import { TM } from './intro_graph_text_provider.js';
import {
  PanelGraph,
} from "../shared";

new PanelGraph({
  level: 'program',
  key : "dead_program_warning",
  footnotes: false,
  calculate: _.property("dead_program"),
  render(){
    return (
      <div 
        className="alert alert-danger alert-no-symbol alert--is-bordered large_panel_text"
        style={{textAlign:"center"}}
      >
        <TM k="dead_program_warning" />
      </div>
    );
  },
});

new PanelGraph({
  level: 'crso',
  key: "dead_crso_warning",
  footnotes: false,
  calculate: _.property("dead_so"),
  render(){
    
    return (
      <div 
        className="alert alert-no-symbol alert-danger alert--is-bordered large_panel_text"
        style={{textAlign:"center"}}
      >
        <TM k="dead_crso_warning"  />
      </div>
    );
  },
});