import { 
  declare_panel, 
  util_components,
  general_utils,
  TextPanel,
  trivial_text_maker,
} from '../shared';

const {
  LabeledTombstone,
  ExternalLink,
} = util_components;

const { sanitized_dangerous_inner_html } = general_utils;


export const declare_igoc_fields_panel = () => declare_panel({
  panel_key: "igoc_fields",
  levels: ["dept"],
  panel_config_func: (level, panel_key) => ({
    calculate: _.constant(true),
    render({calculations}){
      const { subject } = calculations;
  
      const labels_and_items = _.chain(
        [
          ["legal_name", subject.legal_name],
          ["status", subject.status],
          ["end_yr", subject.end_yr],
          ["notes", subject.notes],
          ["applied_title", subject.applied_title],
          ["acronym", subject.fancy_acronym],
          ["previously_named", subject.old_name],
          ["incorp_yr", subject.incorp_yr],
          ["type", subject.type],
          ["website", !subject.is_dead && subject.website_url && <ExternalLink href={`https://${subject.website_url}`} display={subject.website_url} />],
          ["eval_links", !subject.is_dead && subject.eval_url && <ExternalLink href={`https://${subject.eval_url}`} display={subject.eval_url} />],
          ["minister", !_.isEmpty(subject.minister) && _.chain(subject.minister).flatMap( (minister, ix) => [minister, <br key={ix} />]).dropRight().value()],
          ["mandate", subject.mandate && <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(subject.mandate)}/>],
          ["legislation", subject.legislation && <ExternalLink href={`https://google.com/search?q=${encodeURI(subject.legislation)}`} display={subject.legislation} />],
          ["fiscal_end_yr", subject.fiscal_end_yr],
          ["auditor", !_.isEmpty(subject.auditor) && _.chain(subject.auditor).flatMap( (auditor, ix) => [auditor, <br key={ix} />]).dropRight().value()],
          ["fed_ownership", subject.fed_ownership],
          ["board_comp", subject.board_comp],
          ["inst_faa", subject.schedule],
          ["hr_faa", subject.faa_hr],
          ["pas_code", subject.pas_code],
        ]
      )
        .map( ([label_key, item]) => {
          const label = label_key !== "legislation" ?
            trivial_text_maker(label_key) :
            <div dangerouslySetInnerHTML={{__html: trivial_text_maker(label_key)}} />;
  
          return [
            label,
            item,
          ];
        })
        .filter( ([label, item]) => item )
        .value();
  
      return (
        <TextPanel title={trivial_text_maker("org_profile")}>
          <LabeledTombstone labels_and_items={labels_and_items} />
        </TextPanel>
      );
    },
  }),
});