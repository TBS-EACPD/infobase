import { TM } from './intro_graph_text_provider.js';
import { PanelGraph } from "../shared";

new PanelGraph({
  level: 'tag',
  key: "m2m_warning",
  footnotes: false,
  calculate(subject){
    //only display this warning
    return subject.root.id !== "GOCO";
  },

  render: () => (
    <div className='bs-callout bs-callout-danger'>
      <TM k="MtoM_tag_warning"/>
    </div>
  ),
});

