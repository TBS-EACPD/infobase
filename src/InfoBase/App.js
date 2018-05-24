import { ReactUnmounter } from '../core/NavComponents';

import { Route, Switch } from 'react-router';
//import { Link, NavLink } from 'react-router-dom';
import { initialize_analytics } from '../core/analytics.js';

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};

import { ComponentLoader } from '../core/ComponentLoader.js';
import { Home } from '../home/home.js';
import { InfoGraph } from '../infographic/infographic.js';
import { PartitionRoute } from '../partition/partition_subapp/PartitionRoute.js';
import { BudgetMeasuresRoute } from '../partition/budget_measures_subapp/BudgetMeasuresRoute.js';
import { Glossary } from '../glossary/glossary.js';
import { BubbleExplore } from '../dept_explore/dept_explore.js';
import { ReportBuilder } from '../rpb/index.js';
import { TooltipActivator } from '../glossary/Tooltips';
import { PotentialSurveyBox } from '../core/survey_link';
import { EasyAccess } from '../core/EasyAccess';
import { GraphInventory } from '../graph_route/graph_route.js';
import { DevStuff } from '../components/ExplorerComponents.js';

async function getAboutComponent(){
  const {About} = await import('../about/about.js');
  return About;
}

async function getMetadataComponent(){
  const { MetaData } = await import('../metadata/metadata.js');
  return MetaData;
}

async function getIgocComponent(){
  const {IgocExplorer} = await import('../igoc_explorer/igoc_explorer.js');
  return IgocExplorer;
}

async function getResourceExplorerComponent(){
  const {ResourceExplorer} = await import('../resource_explorer/resource-explorer.js');
  return ResourceExplorer;
}


// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))


export class App extends React.Component {
  constructor(){
    super();
    initialize_analytics();
  }
  render(){
    return (
      <div tabIndex={-1} id="app-focus-root">
        <TooltipActivator />
        <ReactUnmounter />
        <PotentialSurveyBox />
        <EasyAccess />
        <Switch>
          <Route path="/metadata/:data_source?" component={ComponentLoader(getMetadataComponent)}/>
          <Route path="/igoc/:grouping?" component={ComponentLoader(getIgocComponent)} />
          <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={ComponentLoader(getResourceExplorerComponent)} />
          <Route path="/orgs/:level/:subject_id/infograph/:bubble?/" component={InfoGraph} />
          <Route path="/glossary/:active_key?" component={Glossary} />
          <Route path="/partition/:perspective?/:data_type?" component={PartitionRoute} />
          <Route path="/budget-measures/:first_column?" component={BudgetMeasuresRoute} />
          <Route path="/explore-:perspective?" component={BubbleExplore} />
          <Route path="/rpb/:config?" component={ReportBuilder} />
          <Route path="/about" component={ComponentLoader(getAboutComponent)} />
          <Route path="/graph/:level?/:graph?/:id?" component={GraphInventory} />
          <Route path="/dev" component={DevStuff} />
          <Route path="/" component={Home} />
        </Switch>
      </div>
    );
  }
}

