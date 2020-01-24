import { withRouter } from 'react-router';

import { has_local_storage } from './feature_detection.js';

import { FixedPopover } from '../components/index.js';

// less likely for users without local storage since they will always have a chance to see it, even after interacting with it
const base_chance = has_local_storage ? 0.25 : 0.05;
const chance_increment = has_local_storage ? 0.1 : 0.05;

export const SurveyPopup = withRouter(
  class _SurveyPopup extends React.Component {
    constructor(props){
      super(props);

      const { history } = props;

      history.listen(
        (location, action) => {
          if (action === 'PUSH' && history){
            this.setState({
              chance: this.state.chance + chance_increment,
            });
          }
        }
      );

      this.state = {
        active: true,
        chance: base_chance,
      };
    }
    shouldComponentUpdate(nextProps, nextState){
      const {
        active,
        chance,
      } = nextState;
      
      const should_get_chance_to_render = active && chance > this.state.chance;

      return should_get_chance_to_render;
    }
    render(){
      const { chance } = this.state;

      return null;
    }
  }
);