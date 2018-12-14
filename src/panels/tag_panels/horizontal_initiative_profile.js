import text from './horizontal_initiative_profile.yaml';
import { 
  PanelGraph, 
  util_components, 
  TextPanel,
} from '../shared';

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

    const labels_and_items = _.chain(subject.lookups)
      .map(
        (value, key) => [key, value]
      )
      .filter( ([label, item]) => item && !_.isArray(item) && !_.isObject(item) )
      .value()

    return (
      <TextPanel title={text_maker("horizontal_initiative_profile")}>
        <LabeledTombstone labels_and_items={labels_and_items} />
      </TextPanel>
    );
  },
});
