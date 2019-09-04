import { text_maker } from './intro_graph_text_provider.js';
import {
  declare_panel,
  TextPanel,
  general_utils,
  util_components,
} from "../shared";

const { sanitized_dangerous_inner_html } = general_utils;
const { LabeledTombstone } = util_components;


export const declare_profile_panel = () => declare_panel({
  panel_key: "profile",
  levels: ['crso', 'program'],
  panel_config_func: (level, panel_key) => ({
    level: level,
    key: panel_key,
    calculate: (subject) =>_.nonEmpty([subject.old_name, subject.description]),
    render({calculations}){
      const { subject } = calculations;
  
      const labels_and_items = _.chain(
        [
          ["name", subject.name],
          ["status", subject.status],
          ["previously_named", subject.old_name],
          ["description", subject.description && <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(subject.description)}/>],
          ["activity_code", subject.activity_code],
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


export const declare_description_panel = () => declare_panel({
  panel_key: "description",
  levels: ["tag"],
  panel_config_func: (level, panel_key) => ({
    level: level,
    key: panel_key,
    footnotes: false,
    calculate: subject => _.nonEmpty(subject.description),
    render({calculations}){
      const {subject} = calculations;
  
      return (
        <TextPanel title={text_maker('tag_desc_title')}>
          <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(subject.description)} />
        </TextPanel>
      );
    },
  }),
});