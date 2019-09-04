import text from "./gov_related.yaml";
import { 
  declare_panel,
  create_text_maker,
  TM,
  Panel,
} from "../shared.js";

const text_maker = create_text_maker(text);


export const declare_gov_related_info_panel = () => declare_panel({
  panel_key: "gov_related_info",
  levels: ['gov'],
  panel_config_func: (level, panel_key) => ({
    level,
    key: panel_key,
    footnotes: false,
    depends_on: [ ],
    info_deps: [ ],
    calculate: _.constant(true),
    render(){
      return (
        <Panel title={text_maker("gov_related_info_title")}>
          <div 
            className="medium_panel_text"
            style={{lineHeight: "40px"}}
          >
            <TM tmf={text_maker} k="gov_related_info_text" />
          </div>
        </Panel>
      );
    },
  }),
});
