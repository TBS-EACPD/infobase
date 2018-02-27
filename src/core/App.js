import { ReactUnmounter, LangSynchronizer } from './NavComponents';

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
import { Glossary } from '../glossary/glossary.js';
import { initialize_analytics } from './analytics.js';


// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))





export class App extends React.Component {
  render(){
    return (
      <div tabIndex={-1} id="app-focus-root">
        <LangSynchronizer />
        <ReactUnmounter />
        <Switch>
          <Route exact path="/start" component={Home}/>
          <Route exact path="/metadata" component={MetaData}/>
          <Route path="/igoc/:grouping?" component={IgocExplorer} />
          <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={ResourceExplorer} />
          <Route path="/orgs/:level/:subject_id/infograph/:bubble?/" component={InfoGraph} />
          <Route path="/glossary/:active_key?" component={Glossary} />
          <Route component={Home} /> {/* 404 / catch all */}
        </Switch>
      </div>
    );
  }
  componentWillMount(){
    initialize_analytics();
  }
}

