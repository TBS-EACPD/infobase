import { Route, Switch } from 'react-router';
import { Link, NavLink } from 'react-router-dom';

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};

import { Home } from '../home/home.js';
import { Metadata, MetaData } from '../metadata/metadata.js';
import { IgocExplorer } from "../igoc_explorer/igoc_explorer.js";


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