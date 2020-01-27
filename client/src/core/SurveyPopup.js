import text from "./SurveyPopup.yaml";

import { withRouter } from 'react-router';

import { has_local_storage } from './feature_detection.js';

import { FixedPopover, create_text_maker_component } from '../components/index.js';

const {
  TM,
  text_maker,
} = create_text_maker_component(text);


const route_root = (path) => _.chain(path)
  .replace(/^\//, '')
  .split('/')
  .first()
  .value();


// less likely for users without local storage since they will always have a chance to see it, even after previously filling it out or dimissing it
const chance_increment = has_local_storage ? 0.1 : 0.05;


export const SurveyPopup = withRouter(
  class _SurveyPopup extends React.Component {
    constructor(props){
      super(props);

      this.handleButtonPress.bind(this);

      const {
        active,
        chance,
      } = (
        () => {
          const default_state = {
            active: true,
            chance: 0,
          };

          if (has_local_storage){
            return _.mapValues(
              default_state,
              (default_value, key) => {
                const local_storage_value = localStorage.getItem(`infobase_survey_popup_${key}`);
                return !_.isNull ? local_storage_value : default_value;
              }
            );
          } else {
            return default_state;
          }
        }
      )();

      props.history.listen(
        ({pathname}) => {
          if ( this.state.active && this.state.previous_route_root !== route_root(pathname) ){
            const new_chance = this.state.chance + chance_increment;

            localStorage.setItem(`infobase_survey_popup_chance`, new_chance);

            this.setState({
              chance: new_chance,
              previous_route_root: route_root(pathname),
            });
          }
        }
      );

      this.state = {
        active: active,
        previous_route_root: null,
        chance: chance,
      };
    }
    handleButtonPress(button_type){
      if ( _.includes(["yes", "no"], button_type) ){
        localStorage.getItem(`infobase_survey_popup_active`, false);
        localStorage.getItem(`infobase_survey_popup_deactivated_unix_time`, Date.now());

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