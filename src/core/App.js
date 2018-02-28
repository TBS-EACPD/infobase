import { ReactUnmounter } from './NavComponents';

import { Route, Switch } from 'react-router';
//import { Link, NavLink } from 'react-router-dom';
import { initialize_analytics } from './analytics.js';

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
import { Glossary } from '../glossary/glossary.js';
import { BubbleExplore } from '../dept_explore/dept_explore.js';
import { ReportBuilder } from '../rpb/index.js';
import { TooltipActivator } from '../glossary/Tooltips';
import { PotentialSurveyBox } from './survey_link';


// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))





export class App extends React.Component {
  render(){
    return (
      <div tabIndex={-1} id="app-focus-root">
        <TooltipActivator />
        <ReactUnmounter />
        <PotentialSurveyBox />
        <Switch>
          <Route exact path="/start" component={Home}/>
          <Route path="/metadata/:data_source?" component={MetaData}/>
          <Route path="/igoc/:grouping?" component={IgocExplorer} />
          <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={ResourceExplorer} />
          <Route path="/orgs/:level/:subject_id/infograph/:bubble?/" component={InfoGraph} />
          <Route path="/glossary/:active_key?" component={Glossary} />
          <Route path="/partition/:method?/:value_attr?" component={Partition} />
          <Route path="/explore-:perspective?" component={BubbleExplore} />
          <Route path="/rpb/:config?" component={ReportBuilder} />
          <Route path="/start" component={Home} />
        </Switch>
      </div>
    );
  }
  componentWillMount(){
    initialize_analytics();
  }
}

