import text from './profile_panels.yaml';

import {
  TextPanel,
  general_utils,
  util_components,
  create_text_maker_component,

  declare_panel,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);
const { sanitized_dangerous_inner_html, generate_href } = general_utils;
const { LabeledTombstone, ExternalLink } = util_components;


const get_org_profile_fields = (subject) => [
  ["legal_name", subject.legal_name],
  ["status", subject.status],
  ["end_yr", subject.end_yr],
  ["notes", subject.notes],
  ["applied_title", subject.applied_title],
  ["acronym", subject.abbr],
  ["previously_named", subject.old_name],
  ["incorp_yr", subject.incorp_yr],
  ["type", subject.type],
  ["website", !subject.is_dead && subject.website_url && <ExternalLink href={generate_href(subject.website_url)}>{subject.website_url}</ExternalLink>],
  ["eval_links", !subject.is_dead && subject.eval_url && <ExternalLink href={generate_href(subject.eval_url)}>{subject.eval_url}</ExternalLink>],
  ["minister", !_.isEmpty(subject.minister) && _.chain(subject.minister).flatMap( (minister, ix) => [minister, <br key={ix} />]).dropRight().value()],
  ["mandate", subject.mandate && <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(subject.mandate)}/>],
  ["legislation", subject.legislation],
  ["fiscal_end_yr", subject.fiscal_end_yr],
  ["auditor", subject.auditor],
  ["fed_ownership", subject.fed_ownership],
  ["board_comp", subject.board_comp],
  ["inst_faa", subject.schedule],
  ["hr_faa", subject.faa_hr],
  ["pas_code", subject.pas_code],
];
const get_profile_fields = (subject) => [
  ["name", subject.name],
  ["status", subject.status],
  ["previously_named", subject.old_name],
  ["description", subject.description && <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(subject.description)}/>],
  ["activity_code", subject.activity_code],
];
export const declare_profile_panel = () => declare_panel({
  panel_key: "profile",
  levels: ['dept', 'crso', 'program'],
  panel_config_func: (level, panel_key) => ({
    calculate: (subject) =>_.nonEmpty([subject.old_name, subject.description]),
    render({calculations}){
      const { subject } = calculations;
  
      const profile_fields = level === 'dept' ?
        get_org_profile_fields(subject) :
        get_profile_fields(subject);

      const labels_and_items = _.chain(profile_fields)
        .map( ([label_key, item]) => {
          const label = label_key !== "legislation" ? 
            text_maker(label_key) : 
            <TM k={label_key} el="div" />;
  
          return [
            label,
            item,
          ];
        })
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
