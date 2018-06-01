import { text_maker } from './intro_graph_text_provider.js';
import {
  PanelGraph,
  TextPanel,
} from "../shared";

const title_keys = {
  tag: 'tag_desc_title',
  crso: 'crso_desc_title',
  program: 'program_desc_title',
};

_.each(['tag','crso','program'], level => {
  new PanelGraph({
    level,
    key : "description",
    footnotes: false,
    calculate: subject => _.nonEmpty(subject.description),

    render(panel,calculations){
      
      const {subject} = calculations;
      
      return <TextPanel title={text_maker(title_keys[level])}>
        <p> {subject.description} </p>
      </TextPanel>

    },
  });
});
