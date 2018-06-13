import text from "./gov_related.yaml";
import { 
  PanelGraph,
  create_text_maker,
  TM,
  Panel,
} from "../shared.js";

const text_maker = create_text_maker(text);

new PanelGraph({
  level: 'gov',
  footnotes: false,
  key : "gov_related_info",
  depends_on : [ ],
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
});
