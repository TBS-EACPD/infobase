import '../common_css/non-a11y-site.scss';

import { Suspense } from 'react';
import { Route, Switch } from 'react-router';
import { initialize_analytics } from '../core/analytics.js';

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};

import { ErrorBoundary } from '../core/ErrorBoundary.js';
import { DevFip } from '../core/DevFip.js';
import { TooltipActivator } from '../glossary/TooltipActivator';
import { InsertRuntimeFooterLinks } from '../core/InsertRuntimeFooterLinks.js';
import { ReactUnmounter } from '../core/NavComponents';
import { EasyAccess } from '../core/EasyAccess';
import { SpinnerWrapper } from '../components/SpinnerWrapper.js';

const Home = React.lazy( () => import('../home/home.js') );
const GraphInventory = React.lazy( () => import('../graph_route/GraphInventory.js') );
const PartitionRoute = React.lazy( () => import('../partition/partition_subapp/PartitionRoute.js') );
const BudgetMeasuresRoute = React.lazy( () => import('../partition/budget_measures_subapp/BudgetMeasuresRoute.js') );
const BubbleExplore = React.lazy( () => import("../dept_explore/dept_explore.js") );
const About = React.lazy( () => import('../about/about.js') );
const MetaData = React.lazy( () => import('../metadata/metadata.js') );
const IgocExplorer = React.lazy( () => import('../igoc_explorer/igoc_explorer.js') );
const ResourceExplorer = React.lazy( () => import('../resource_explorer/resource-explorer.js') );
const Glossary = React.lazy( () => import('../glossary/glossary.js') );
const ReportBuilder = React.lazy( () => import("../rpb/index.js") );
const InfoGraph = React.lazy( () => import ("../infographic/infographic.js") );
const EstimatesComparison = React.lazy( () => import ("../EstimatesComparison/EstimatesComparison.js") );

export class App extends React.Component {
  constructor(){
    super();
    initialize_analytics();
  }
  render(){
    return (
      <div tabIndex={-1} id="app-focus-root">
        <ErrorBoundary>
          <DevFip />
          <TooltipActivator />
          <ReactUnmounter />
          <InsertRuntimeFooterLinks />
          <EasyAccess />
          <Suspense fallback={<SpinnerWrapper scale={3} />}>
            <Switch>
              <Route path="/metadata/:data_source?" component={MetaData}/>
              <Route path="/igoc/:grouping?" component={IgocExplorer} />
              <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={ResourceExplorer} />
              <Route path="/orgs/:level/:subject_id/infograph/:bubble?/" component={InfoGraph} />
              <Route path="/glossary/:active_key?" component={Glossary} />
              <Route path="/partition/:perspective?/:data_type?" component={PartitionRoute} />
              <Route path="/budget-measures/:first_column?/:selected_value?" component={BudgetMeasuresRoute} />
              <Route path="/explore-:perspective?" component={BubbleExplore} />
              <Route path="/rpb/:config?" component={ReportBuilder} />
              <Route path="/about" component={About} />
              <Route path="/graph/:level?/:graph?/:id?" component={GraphInventory} />
              <Route path="/compare_estimates" component={EstimatesComparison} />
              <Route path="/" component={Home} />
            </Switch>
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }
}

