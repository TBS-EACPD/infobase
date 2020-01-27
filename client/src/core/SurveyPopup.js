import { withRouter } from 'react-router';

import { has_local_storage } from './feature_detection.js';

import { FixedPopover } from '../components/index.js';

const route_root = (path) => _.chain(path)
  .replace(/^\//, '')
  .split('/')
  .first()
  .value();

// less likely for users without local storage since they will always have a chance to see it, even after previously filling it out or dimissing it
const base_chance = has_local_storage ? 0.2 : 0.05;
const chance_increment = has_local_storage ? 0.05 : 0.01;

export const SurveyPopup = withRouter(
  class _SurveyPopup extends React.Component {
    constructor(props){
      super(props);

      const { history } = props;

      history.listen(
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
    render(){
      const {
        active,
        chance,
      } = this.state;

      const should_render = Math.random() < chance;

      if (active && should_render){
        return <div>bleh</div>;
      } else {
        return null;
      }
    }
  }
);