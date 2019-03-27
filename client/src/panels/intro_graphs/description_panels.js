import { text_maker } from './intro_graph_text_provider.js';
import {
  PanelGraph,
  TextPanel,
  general_utils,
} from "../shared";

const { sanitized_dangerous_inner_html } = general_utils;

const title_keys = {
  tag: 'tag_desc_title',
  crso: 'crso_desc_title',
  program: 'program_desc_title',
};

_.each(['crso','program'], level => {
  new PanelGraph({
    level,
    key: "previously_known_as",
    footnotes: false,
    calculate: subject => _.nonEmpty(subject.old_name),

    render({calculations}){
      
      const {subject} = calculations;

      return (
        <TextPanel title={text_maker("previously_known_as")}>
          <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(subject.old_name)} />
        </TextPanel>
      );

    },
  });
});

_.each(['tag','crso','program'], level => {
  new PanelGraph({
    level,
    key: "description",
    footnotes: false,
    calculate: subject => _.nonEmpty(subject.description),

    render({calculations}){
      
      const {subject} = calculations;

      return (
        <TextPanel title={text_maker(title_keys[level])}>
          <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(subject.description)} />
        </TextPanel>
      );

    },
  });
});
