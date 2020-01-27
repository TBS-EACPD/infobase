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
const should_reset_local_storage = () => !localStorage.getItem(`infobase_survey_popup_active`) &&
  Date.now() - localStorage.getItem(`infobase_survey_popup_deactivated_since`) > seconds_in_a_half_year;

const get_state_defaults = () => {
  const default_state = {
    active: true,
    chance: 0,
  };

  if (has_local_storage){
    return _.mapValues(
      default_state,
      (default_value, key) => {
        const local_storage_value = localStorage.getItem(`infobase_survey_popup_${key}`);
        return !_.isNull(local_storage_value) ? local_storage_value : default_value;
      }
    );
  } else {
    return default_state;
  }
};

// less likely for users without local storage since they will always have a chance to see it, even after previously filling it out or dimissing it
const chance_increment = has_local_storage ? 0.2 : 0.05;

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
        localStorage.setItem(`infobase_survey_popup_active`, null);
        localStorage.setItem(`infobase_survey_popup_chance`, null);
      }

      const {
        active,
        chance,
      } = get_state_defaults();

      this.state = {
        active: active,
        chance: +chance, // comes out of local storage as a string, cast to number here to be safe
        previous_path_root: null,
      };
    }
    handleButtonPress(button_type){
      if ( _.includes(["yes", "no"], button_type) ){
        if (has_local_storage){
          localStorage.setItem(`infobase_survey_popup_active`, false);
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

      if (should_render){
        return <FixedPopover
          show={true}
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
          on_close_callback={() => this.setState({active: false})}
        />;
      } else {
        return null;
      }
    }
  }
);