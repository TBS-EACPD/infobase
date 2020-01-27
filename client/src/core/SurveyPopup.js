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
const base_chance = 1;
const chance_increment = has_local_storage ? 0.1 : 0.05;

export const SurveyPopup = withRouter(
  class _SurveyPopup extends React.Component {
    constructor(props){
      super(props);

      this.handleButtonPress.bind(this);

      props.history.listen(
        ({pathname}) => {
          if ( this.state.previous_route_root !== route_root(pathname) ){
            this.setState({
              chance: this.state.chance + chance_increment,
              previous_route_root: route_root(pathname),
            });
          }
        }
      );

      this.state = {
        active: true,
        previous_route_root: null,
        chance: base_chance,
      };
    }
    handleButtonPress(button_type){
      switch(button_type){
        case "yes":
          //TODO
          break;

        case "no":
          //TODO
          break;
      }

      this.setState({active: false});
    }
    render(){
      const {
        active,
        chance,
      } = this.state;

      const should_render = Math.random() < chance;

      if (active && should_render){
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