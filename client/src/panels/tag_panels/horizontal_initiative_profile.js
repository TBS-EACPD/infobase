import text from './horizontal_initiative_profile.yaml';
import { 
  PanelGraph, 
  util_components, 
  TextPanel,
  Subject,
  formats,
  infograph_href_template,
} from '../shared';

const { Dept } = Subject;

const { 
  create_text_maker_component,
  LabeledTombstone,
  ExternalLink,
} = util_components;

const { text_maker } = create_text_maker_component(text);

new PanelGraph({
  level: 'tag',
  title: "horizontal_initiative_profile",
  key: "horizontal_initiative_profile",
  calculate: subject => subject.root.id === "HI" && !_.isUndefined(subject.lookups) && !_.isEmpty(subject.lookups),
  render({calculations}){
    const { subject } = calculations;

    const hi_lookups = subject.lookups || {};

    const lead_dept = Dept.lookup(hi_lookups.lead_dept);

    const labels_and_items = _.chain(
      [
        ["hi_name", subject.name],
        ["hi_lead_dept", 
          lead_dept && (
            <a href={infograph_href_template(lead_dept)}>
              {`${lead_dept.name} (${lead_dept.fancy_acronym})`}
            </a>
          ),
        ],
        ["hi_start_year", hi_lookups.start_year],
        ["hi_end_year", hi_lookups.end_year],
        ["hi_total_allocated_amount", hi_lookups.total_allocated_amount && formats.compact_raw(hi_lookups.total_allocated_amount, {precision: 2})],
        ["hi_website", hi_lookups.website_url && <ExternalLink href={hi_lookups.website_url} display={hi_lookups.website_url}/>],
        ["hi_dr_link", hi_lookups.dr_url && <ExternalLink href={hi_lookups.dr_url} display={hi_lookups.dr_url}/>],
      ]
    )
      .map( ([label_key, item]) => [text_maker(label_key), item] )
      .filter( ([key, item]) => item )
      .value();

    return (
      <TextPanel title={text_maker("horizontal_initiative_profile")}>
        <LabeledTombstone labels_and_items={labels_and_items} />
      </TextPanel>
    );
  },
});
