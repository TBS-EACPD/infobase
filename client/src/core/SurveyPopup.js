import text from "./SurveyPopup.yaml";

import { Fragment } from 'react';
import { withRouter } from 'react-router';

import { log_standard_event } from './analytics.js';
import { IconFeedback } from '../icons/icons.js';
import { FixedPopover, create_text_maker_component } from '../components/index.js';

const {
  TM,
  text_maker,
} = create_text_maker_component(text);


const chance_increment = 0.2;
const survey_campaign_end_date = new Date(2020, 3, 14).getTime()/1000;


const get_path_root = (path) => _.chain(path)
  .replace(/^\//, '')
  .split('/')
  .first()
  .value();

const seconds_in_a_half_year = 60*60*24*(365/2);
const should_reset_local_storage = () => localStorage.getItem(`infobase_survey_popup_deactivated`) &&
  Date.now() - localStorage.getItem(`infobase_survey_popup_deactivated_since`) > seconds_in_a_half_year;

const get_state_defaults = () => {
  const default_active = true;
  const default_chance = 0;

  const local_storage_deactivated = localStorage.getItem(`infobase_survey_popup_deactivated`);
  const local_storage_chance = localStorage.getItem(`infobase_survey_popup_chance`);

  // localStorage is all strings, note that we cast the values read from it to a boolean and a number below
  return {
    active: !_.isNull(local_storage_deactivated) ? !local_storage_deactivated : default_active,
    chance: !_.isNull(local_storage_chance) ? +local_storage_chance : default_chance,
  };
};

const is_survey_campaign_over = () => Date.now() > survey_campaign_end_date;

export const SurveyPopup = withRouter(
  class _SurveyPopup extends React.Component {
    constructor(props){
      super(props);

      this.handleButtonPress.bind(this);

      props.history.listen(
        ({pathname}) => {
          if ( this.state.active && this.state.previous_path_root !== get_path_root(pathname) ){
            const new_chance = this.state.chance + chance_increment;

            localStorage.setItem(`infobase_survey_popup_chance`, new_chance);

            this.setState({
              chance: new_chance,
              previous_path_root: get_path_root(pathname),
            });
          }
        }
      );

      if ( should_reset_local_storage() ){
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
        localStorage.setItem(`infobase_survey_popup_deactivated`, "true");
        localStorage.setItem(`infobase_survey_popup_deactivated_since`, Date.now());
      }

      log_standard_event({
        SUBAPP: window.location.hash.replace('#','') || "start",
        MISC1: "SURVEY_POPUP",
        MISC2: `interaction: ${button_type}`,
      });

      this.setState({active: false});
    }
    shouldComponentUpdate(nextProps, nextState){
      const chance_to_open_changed = this.state.chance !== nextState.chance;
      const is_closing = this.state.active !== nextState.active;

      return chance_to_open_changed || is_closing;
    }
    componentDidMount(){
      // if a new user bounces from the first page they see, want them to have some chance of getting the popup if they ever return
      // this is clobered by the properly incrementing value for users who don't bounce though
      if (this.state.chance === 0){
        localStorage.setItem(`infobase_survey_popup_chance`, chance_increment);
      }
    }
    render(){
      const {
        active,
        chance,
      } = this.state;

      const should_show = is_survey_campaign_over() && active && Math.random() < chance;

      if (should_show){
        log_standard_event({
          SUBAPP: window.location.hash.replace('#','') || "start",
          MISC1: "SURVEY_POPUP",
          MISC2: 'displayed',
        });
      }

      return <FixedPopover
        show={should_show}
        title={
          <Fragment>
            <IconFeedback
              title={text_maker("suvey_popup_header")}
              color={window.infobase_color_constants.tertiaryColor}
              alternate_color={false}
            />
            {text_maker("suvey_popup_header")}
          </Fragment>
        }
        body={<TM k="survey_popup_body" />}
        footer={
          <Fragment>
            <a 
              href={text_maker("survey_link")}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-ib-primary"
              onClick={ () => this.handleButtonPress('yes') }
            >
              {text_maker('survey_popup_yes')}
            </a>
            {
              _.map(
                ["later", "no"],
                (button_type) => <button 
                  key={button_type}
                  className="btn btn-ib-primary"
                  onClick={ () => this.handleButtonPress(button_type) }
                >
                  {text_maker(`survey_popup_${button_type}`)}
                </button>,
              )
            }
          </Fragment>

        }
      />;
    }
  }
);