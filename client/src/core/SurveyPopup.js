import text from "./SurveyPopup.yaml";

import { withRouter } from 'react-router';

import { has_local_storage } from './feature_detection.js';

import { FixedPopover, create_text_maker_component } from '../components/index.js';

const {
  TM,
  text_maker,
} = create_text_maker_component(text);


const get_path_root = (path) => _.chain(path)
  .replace(/^\//, '')
  .split('/')
  .first()
  .value();

const seconds_in_a_half_year = 60*60*24*(365/2);
const should_reset_local_storage = () => localStorage.getItem(`infobase_survey_popup_deactivated`) &&
  Date.now() - localStorage.getItem(`infobase_survey_popup_deactivated_since`) > seconds_in_a_half_year;

const get_state_defaults = () => {
  const default_state = {
    active: true,
    chance: 0,
  };

  if (has_local_storage){
    const local_storage_deactivated = localStorage.getItem(`infobase_survey_popup_deactivated`);
    const local_storage_chance = localStorage.getItem(`infobase_survey_popup_chance`);

    // localStorage is all strings, so be aware that we cast those to a boolean and a number below
    return {
      active: !_.isNull(local_storage_deactivated) ? !local_storage_deactivated : default_state.active,
      chance: !_.isNull(local_storage_chance) ? +local_storage_chance : default_state.chance,
    };
  } else {
    return default_state;
  }
};

// Make it less likely for users without local storage to get the popup to balance that they will always have a chance to see it,
// even after previously dimissing it. Going by caniuse.com stats, that's less than 8% of users globally, and shrinking, anyway
const chance_increment = has_local_storage ? 0.15 : 0.05;

export const SurveyPopup = withRouter(
  class _SurveyPopup extends React.Component {
    constructor(props){
      super(props);

      this.handleButtonPress.bind(this);

      props.history.listen(
        ({pathname}) => {
          if ( this.state.active && this.state.previous_path_root !== get_path_root(pathname) ){
            const new_chance = this.state.chance + chance_increment;

            has_local_storage && localStorage.setItem(`infobase_survey_popup_chance`, new_chance);

            this.setState({
              chance: new_chance,
              previous_path_root: get_path_root(pathname),
            });
          }
        }
      );

      if ( has_local_storage && should_reset_local_storage() ){
        localStorage.removeItem('infobase_survey_popup_chance');
        localStorage.removeItem('infobase_survey_popup_deactivated');
        localStorage.removeItem('infobase_survey_popup_deactivated_since');
      }

      const {
        active,
        chance,
      } = get_state_defaults();

      this.state = {
        active: active,
        chance: chance,
        previous_path_root: null,
      };
    }
    handleButtonPress(button_type){
      if ( _.includes(["yes", "no"], button_type) ){
        if (has_local_storage){
          localStorage.setItem(`infobase_survey_popup_deactivated`, "true");
          localStorage.setItem(`infobase_survey_popup_deactivated_since`, Date.now());
        }

        if (button_type === "yes"){
          window.open( text_maker("survey_link") );
        }
      }

      this.setState({active: false});
    }
    shouldComponentUpdate(nextProps, nextState){
      const has_new_chance_to_open = this.state.chance !== nextState.chance;
      const is_closing = this.state.active !== nextState.active;

      return has_new_chance_to_open || is_closing;
    }
    render(){
      const {
        active,
        chance,
      } = this.state;

      const should_render = active && Math.random() < chance;

      return <FixedPopover
        show={should_render}
        header={<TM k="suvey_popup_header" />}
        body={<TM k="survey_popup_body" />}
        footer={
          _.chain([
            "yes",
            "later",
            has_local_storage && "no",
          ])
            .compact()
            .map( (button_type) => (
              <button 
                className="btn btn-ib-primary"
                key={button_type}
                onClick={ () => this.handleButtonPress(button_type) }
              >
                {text_maker(`survey_popup_${button_type}`)}
              </button>
            ) )
            .value()
        }
      />;
    }
  }
);