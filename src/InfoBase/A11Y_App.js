import { ReactUnmounter } from '../core/NavComponents';

import { Route, Switch } from 'react-router';
//import { Link, NavLink } from 'react-router-dom';
import { initialize_analytics } from '../core/analytics.js';

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};

import { Home } from '../home/a11y_home.js';
import { MetaData } from '../metadata/metadata.js';
import { IgocExplorer } from "../igoc_explorer/igoc_explorer.js";
import { ResourceExplorer } from "../resource_explorer/resource-explorer.js";
import { InfoGraph } from '../infographic/infographic.js';
import { BudgetMeasuresRoute } from '../partition/budget_measures_subapp/BudgetMeasuresRoute.js';
import { Glossary } from '../glossary/glossary.js';
import { ReportBuilder } from '../rpb/index.js';
import { TooltipActivator } from '../glossary/Tooltips';
import { EasyAccess } from '../core/EasyAccess';
import { About } from '../about/about.js';
import { GraphInventory } from '../graph_route/graph_route.js';
import {EstimatesComparison} from "../EstimatesComparison/EstimatesComparison.js";


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
        <EasyAccess />
        <Switch>
          <Route path="/metadata/:data_source?" component={MetaData}/>
          <Route path="/igoc/:grouping?" component={IgocExplorer} />
          <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={ResourceExplorer} />
          <Route path="/orgs/:level/:subject_id/infograph/:bubble?/" component={InfoGraph} />
          <Route path="/budget-measures/:first_column?" component={BudgetMeasuresRoute} />
          <Route path="/glossary/:active_key?" component={Glossary} />
          <Route path="/rpb/:config?" component={ReportBuilder} />
          <Route path="/about" component={About} />
          <Route path="/graph/:level?/:graph?/:id?" component={GraphInventory} />
          <Route path="/compare_estimates" component={EstimatesComparison} />
          <Route path="/" component={Home} />
        </Switch>
      </div>
    );
  }
}

