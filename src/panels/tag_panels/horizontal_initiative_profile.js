import text from './horizontal_initiative_profile.yaml';
import { 
  PanelGraph, 
  util_components, 
  TextPanel,
  Subject,
  formats,
} from '../shared';

const { Dept } = Subject;

const { 
  create_text_maker_component,
  LabeledTombstone,
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

    const labels_and_items = _.chain(
      [
        ["hi_lead_dept", Dept.lookup(hi_lookups.lead_dept) && `${Dept.lookup(hi_lookups.lead_dept).name} (${Dept.lookup(hi_lookups.lead_dept).fancy_acronym})`],
        ["hi_governance", hi_lookups.governance],
        ["hi_start_year", hi_lookups.start_year],
        ["hi_renewal_year", hi_lookups.renewal_year],
        ["hi_eval_year", hi_lookups.eval_year],
        ["hi_end_year", hi_lookups.end_year],
        ["hi_spending_planned", hi_lookups.spending_planned && formats.compact_raw(hi_lookups.spending_planned)],
        ["hi_spending_actual", hi_lookups.spending_actual && formats.compact_raw(hi_lookups.spending_actual)],
        ["hi_spending_cumulative", hi_lookups.spending_cumulative && formats.compact_raw(hi_lookups.spending_cumulative)],
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
