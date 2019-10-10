import { TM } from './intro_graph_text_provider.js';
import { declare_panel, util_components } from "../shared";

const { AlertBanner } = util_components;

export const declare_dead_program_warning_panel = () => declare_panel({
  panel_key: "dead_program_warning",
  levels: ['program'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate: _.property("dead_program"),
    render(){
      return (
        <AlertBanner
          banner_class="alert-danger"
          style={{textAlign: "center"}}
        >
          <TM k="dead_program_warning" />
        </AlertBanner>
      );
    },
  }),
});


export const declare_dead_crso_warning_panel = () => declare_panel({
  panel_key: "dead_crso_warning",
  levels: ['crso'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate: _.property("is_dead"),
    render(){
      
      return (
        <AlertBanner
          banner_class="alert-danger"
          style={{textAlign: "center"}}
        >
          <TM k="dead_crso_warning" />
        </AlertBanner>
      );
    },
  }),
});



export const declare_year_warning_panel = () => declare_panel({
  panel_key: "year_warning",
  levels: ['gov','dept','crso','program'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate: (subject, info, options) => {
      return !subject.is_dead && _.last(info.last_years) !== _.first(info.planning_years);
    },
    render({calculations}){
      const { info } = calculations;
      return (
        <div 
          className="alert alert-info alert-no-symbol alert--is-bordered large_panel_text"
          style={{textAlign: "center"}}
        >
          <TM k="year_warning" args={{year: info.public_accounts_year}}/>
        </div>
      );
    },
  }),
});
