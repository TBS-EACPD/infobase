import text from './horizontal_initiative_profile.yaml';
import { 
  PanelGraph, 
  util_components, 
  TextPanel,
} from '../shared';

const { create_text_maker_component } = util_components;

const { text_maker, TM } = create_text_maker_component(text);

new PanelGraph({
  level: 'tag',
  title: "horizontal_initiative_profile",
  key: "horizontal_initiative_profile",
  calculate: subject => subject.root.id === "HI" && !_.isUndefined(subject.lookups) && !_.isEmpty(subject.lookups),
  render({calculations}){
    const { subject } = calculations;

    return (
      <TextPanel title={text_maker("horizontal_initiative_profile")}>
        <span>
          {"Messy dev placeholder:"}
        </span>
        <ul>
          {
            _.chain(subject.lookups)
              .sort()
              .map(
                (value, key) => (
                  <li key={key}>
                    {`${key}: ${value}`}
                  </li>
                )
              )
              .value()
          }
        </ul>
      </TextPanel>
    );
  },
});
