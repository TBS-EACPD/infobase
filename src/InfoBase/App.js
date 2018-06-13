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
import { TooltipActivator } from '../glossary/Tooltips';
import { PotentialSurveyBox } from '../core/survey_link';
import { EasyAccess } from '../core/EasyAccess';
import { DevStuff } from '../components/ExplorerComponents.js';

const LazyGraphRoute = ComponentLoader(async () => {
  const { GraphInventory } = await import('../graph_route/graph_route.js');
  return GraphInventory;
})

const LazyPartitionRoute = ComponentLoader(async () => {
  const { PartitionRoute } = await import('../partition/partition_subapp/PartitionRoute.js');
  return PartitionRoute;
})

const LazyBudgetMeasuresRoute =  ComponentLoader(async () => {
  const {BudgetMeasuresRoute} = await import('../partition/budget_measures_subapp/BudgetMeasuresRoute.js')
  return BudgetMeasuresRoute;
});

const LazyBubbleExplore = ComponentLoader(async ()=>{
  const { BubbleExplore } = await import("../dept_explore/dept_explore.js");
  return BubbleExplore;
})

const LazyAbout = ComponentLoader(async () => {
  const {About} = await import('../about/about.js');
  return About;
});

const LazyMetadata = ComponentLoader(async () =>{
  const { MetaData } = await import('../metadata/metadata.js');
  return MetaData;
})

const LazyIgoc = ComponentLoader(async () => {
  const {IgocExplorer} = await import('../igoc_explorer/igoc_explorer.js');
  return IgocExplorer;
});

const LazyResourceExplorer = ComponentLoader(async () => {
  const {ResourceExplorer} = await import('../resource_explorer/resource-explorer.js');
  return ResourceExplorer;
});

const LazyGlossary = ComponentLoader(async () => {
  const {Glossary} = await import('../glossary/glossary.js');
  return Glossary;
});

const LazyRPB = ComponentLoader(async () => {
  const { ReportBuilder } = await import("../rpb/index.js");
  return ReportBuilder;
})

const LazyInfoGraph = ComponentLoader(async () => {
  const { InfoGraph } = await import ("../infographic/infographic.js");
  return InfoGraph;
})


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
          <Route path="/metadata/:data_source?" component={LazyMetadata}/>
          <Route path="/igoc/:grouping?" component={LazyIgoc} />
          <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={LazyResourceExplorer} />
          <Route path="/orgs/:level/:subject_id/infograph/:bubble?/" component={LazyInfoGraph} />
          <Route path="/glossary/:active_key?" component={LazyGlossary} />
          <Route path="/partition/:perspective?/:data_type?" component={LazyPartitionRoute} />
          <Route path="/budget-measures/:first_column?" component={LazyBudgetMeasuresRoute} />
          <Route path="/explore-:perspective?" component={LazyBubbleExplore} />
          <Route path="/rpb/:config?" component={LazyRPB} />
          <Route path="/about" component={LazyAbout} />
          <Route path="/graph/:level?/:graph?/:id?" component={LazyGraphRoute} />
          <Route path="/dev" component={DevStuff} />
          <Route path="/" component={Home} />
        </Switch>
      </div>
    );
  }
}

