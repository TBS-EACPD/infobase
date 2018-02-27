import { Route, Switch } from 'react-router';
//import { Link, NavLink } from 'react-router-dom';

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};

import { Home } from '../home/home.js';
import { MetaData } from '../metadata/metadata.js';
import { IgocExplorer } from "../igoc_explorer/igoc_explorer.js";
import { ResourceExplorer } from "../program_explorer/resource-explorer.js";
import { InfoGraph } from '../infographic/infographic.js';
import { Partition } from '../program_explorer2/pe2.js';


// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))

export class App extends React.Component {
  render(){
    return (
      <div tabIndex={-1} id="app-focus-root">
        <LangSynchronizer />
        <Switch>
          <Route exact path="/start" component={Home}/>
          <Route exact path="/metadata" component={MetaData}/>
          <Route path="/igoc/:grouping?" component={IgocExplorer} />
          <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={ResourceExplorer} />
          <Route path="/orgs/:level/:id/infograph/:bubble?/" component={InfoGraph} />
          <Route path="/partition/:method?/:value_attr?" component={Partition} />
          <Route component={Home} /> {/* 404 / catch all */}
        </Switch>
      </div>
    );
  }
}

class LangSynchronizer extends React.Component {
  render(){ return null; }
  componentDidUpdate(){ this._update(); }
  componentDidMount(){ this._update(); }
  _update(){

    //TODO: probabbly being too defensive here
    const el_to_update = document.querySelector('#wb-lng a');
    const newHash = document.location.hash.split("#")[1] || "";
    if (_.get(el_to_update, "href")){
      const link = _.first(el_to_update.href.split("#"));
      if(link){
        el_to_update.href = `${link}#${newHash}`;
      }
    }
  }
}