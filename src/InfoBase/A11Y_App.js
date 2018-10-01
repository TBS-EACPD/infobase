import { ReactUnmounter } from '../core/NavComponents';

import { Route, Switch } from 'react-router';
//import { Link, NavLink } from 'react-router-dom';
import { initialize_analytics } from '../core/analytics.js';

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};

import { ComponentLoader } from '../core/ComponentLoader.js';
import { EasyAccess } from '../core/EasyAccess';
import { InsertRuntimeFooterLinks } from '../core/InsertRuntimeFooterLinks.js';
import { DevFip } from '../core/DevFip.js';

const LazyHome = ComponentLoader(async () => {
  const { Home } = await import('../home/a11y_home.js');
  return Home;
})

const LazyMetaData = ComponentLoader(async () => {
  const { MetaData } = await import('../metadata/metadata.js');
  return MetaData;
})

const LazyIgocExplorer = ComponentLoader(async () => {
  const { IgocExplorer } = await import('../igoc_explorer/igoc_explorer.js');
  return IgocExplorer;
})

const LazyResourceExplorer = ComponentLoader(async () => {
  const { ResourceExplorer } = await import('../resource_explorer/resource-explorer.js');
  return ResourceExplorer;
})

const LazyInfoGraph = ComponentLoader(async () => {
  const { InfoGraph } = await import('../infographic/infographic.js');
  return InfoGraph;
})

const LazyBudgetMeasuresRoute = ComponentLoader(async () => {
  const { BudgetMeasuresRoute } = await import('../partition/budget_measures_subapp/BudgetMeasuresRoute.js');
  return BudgetMeasuresRoute;
})

const LazyGlossary = ComponentLoader(async () => {
  const { Glossary } = await import('../glossary/glossary.js');
  return Glossary;
})

const LazyReportBuilder = ComponentLoader(async () => {
  const { ReportBuilder } = await import('../rpb/index.js');
  return ReportBuilder;
})

const LazyAbout = ComponentLoader(async () => {
  const { About } = await import('../about/about.js');
  return About;
})

const LazyGraphInventory = ComponentLoader(async () => {
  const { GraphInventory } = await import('../graph_route/graph_route.js');
  return GraphInventory;
})

const LazyEstimatesComparison = ComponentLoader(async () => {
  const { EstimatesComparison } = await import('../EstimatesComparison/EstimatesComparison.js');
  return EstimatesComparison;
})

export class App extends React.Component {
  constructor(){
    super();
    initialize_analytics();
  }
  render(){
    return (
      <div tabIndex={-1} id="app-focus-root">
        <ReactUnmounter />
        <InsertRuntimeFooterLinks />
        <DevFip />
        <EasyAccess />
        <Switch>
          <Route path="/metadata/:data_source?" component={LazyMetaData}/>
          <Route path="/igoc/:grouping?" component={LazyIgocExplorer} />
          <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={LazyResourceExplorer} />
          <Route path="/orgs/:level/:subject_id/infograph/:bubble?/" component={LazyInfoGraph} />
          <Route path="/budget-measures/:first_column?/:selected_value?" component={LazyBudgetMeasuresRoute} />
          <Route path="/glossary/:active_key?" component={LazyGlossary} />
          <Route path="/rpb/:config?" component={LazyReportBuilder} />
          <Route path="/about" component={LazyAbout} />
          <Route path="/graph/:level?/:graph?/:id?" component={LazyGraphInventory} />
          <Route path="/compare_estimates" component={LazyEstimatesComparison} />
          <Route path="/start/:no_basic_equiv?" component={LazyHome} />
          <Route path="/" component={LazyHome} />
        </Switch>
      </div>
    );
  }
}

