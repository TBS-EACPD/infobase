import classNames from 'classnames';
import { combineReducers, createStore }  from 'redux';
import { Provider, connect } from 'react-redux';
import { infograph_href_template } from '../../link_utils.js';
import { get_root } from '../../gen_expl/hierarchy_tools.js';
import { get_col_defs } from '../../gen_expl/resource-explorer-common.js';

import { Explorer } from '../../components/ExplorerComponents.js';

import {
  PanelGraph,
  reactAdapter,
  util_components,
} from "../shared";


import { 
  create_rooted_resource_scheme,
  get_initial_resource_state,
} from '../../gen_expl/rooted_resource_scheme.js';



import {
  get_memoized_funcs,
  initial_root_state,
  root_reducer,
  map_state_to_root_props_from_memoized_funcs,
  map_dispatch_to_root_props,
} from '../../gen_expl/state_and_memoizing';

const { 
  TM, 
  TextMaker,
} = util_components;


const get_non_col_content = ({node}) => { 
  const {
    data:{
      defs,
      subject,
    },
  } = node;
  return (
    <div>
      {
        !_.isEmpty(defs) && 
        <dl className="dl-horizontal">
          {_.map(defs, ({ term, def }, ix) => [ 
            /* eslint-disable react/jsx-key */
            <dt key={`dt-${ix}`}> { term } </dt>,
            /* eslint-disable react/jsx-key */
            <dd key={`dd-${ix}`}> { def } </dd>,
          ])}
        </dl>
      }
      { (
        _.includes(['program','dept', 'crso'], subject.level) || 
        subject.level === 'tag' && !_.isEmpty(subject.programs) //only tags with programs (i.e. not tags that are just group of tags) have infographics
      ) && 
        <div className='ExplorerNode__BRLinkContainer'>
          <a href={infograph_href_template(subject)}> 
            <TextMaker text_key="see_infographic" />
          </a>
        </div>
      }
    </div>
  );
};

class RootedResourceExplorer extends React.Component {
  render(){
    const {
      flat_nodes,
      toggle_node,
      
      //scheme props
      is_descending,
      sort_col,
      col_click,
      doc,
      set_doc,
    } = this.props;

    const root = get_root(flat_nodes);

    const explorer_config = {
      column_defs: get_col_defs({doc}),
      onClickExpand: id => toggle_node(id),
      is_sortable: true,
      zebra_stripe: true,
      get_non_col_content,
      col_click,
      children_grouper,
    };

    const inner_content = <div>
      <div 
        tabIndex={-1} 
        ref="focus_mount" 
        style={{position:'relative'}}
      >
        <Explorer
          config={explorer_config}
          root={root}
          col_state={{
            sort_col,
            is_descending,
          }}
        />
      </div>
    </div>;
 
    const tab_on_click = (doc)=> set_doc!==doc && set_doc(doc);

    return <div>
      <div className="tabbed_content">
        <ul className="tabbed_content_label_bar">
          <li className={classNames("tab_label", doc==="drr16" && "active_tab")} onClick={()=> tab_on_click('drr16')}>
            <span tabIndex={0} role="button" aria-pressed={doc === "drr16"} className="tab_label_text" onClick={()=> tab_on_click('drr16')} onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && tab_on_click('drr16')}>
              <TM k="DRR_resources_option_title" />
            </span>
          </li>
          <li className={classNames("tab_label", doc==="dp17" && "active_tab")} onClick={()=> tab_on_click('dp17')}>
            <span tabIndex={0} role="button" aria-pressed={doc === "dp17"} className="tab_label_text" onClick={()=> tab_on_click('dp17')} onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && tab_on_click('dp17')}>
              <TM k="DP_resources_option_title" />
            </span>
          </li>
        </ul>
        <div className="tabbed_content_pane">
          {inner_content}
        </div>
      </div>
    </div>;

  }
}


const map_state_to_props_from_memoized_funcs = memoized_funcs => {

  const  { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(memoized_funcs);

  return state => _.immutate(
    mapRootStateToRootProps(state),
    get_scheme_props(state)
  );
}

const children_grouper = (node, children) => {
  //this one only has one depth, so the root must group its children
  return _.chain(children)
    .groupBy(child => child.data.header )
    .map( (node_group,header) => ({
      display: header,
      node_group,
    }))
    .value();
}

  


class RootedResourceExplorerContainer extends React.Component {
  render(){
    const { 
      rooted_resource_scheme : scheme,
      initial_rooted_resource_state, 
    } = this.props;
    
    const scheme_key = scheme.key;

    const reducer = combineReducers({
      root: root_reducer, 
      [scheme_key]: scheme.reducer,
    });

    const mapDispatchToProps = dispatch => _.immutate(
      map_dispatch_to_root_props(dispatch), 
      scheme.dispatch_to_props(dispatch)
    );

    const mapStateToProps = map_state_to_props_from_memoized_funcs(get_memoized_funcs([ scheme ]));

    const initialState = {
      root: _.immutate(initial_root_state, {scheme_key}),
      [scheme_key]: initial_rooted_resource_state,
    };

    const Container = connect(mapStateToProps, mapDispatchToProps)(RootedResourceExplorer)

    return (
      <Provider store={createStore(reducer,initialState)}>
        <Container
          scheme={scheme}
        />
      </Provider>
    );

  }

}


new PanelGraph({
  level: 'tag',
  footnotes: false,
  depends_on : ['table6','table12'],
  key: "resource_structure",
  layout: {
    full: { graph: 12},
    half: { graph: 12},
  },
  title: "resource_structure_title",
  calculate(subject){
    const { table6 } = this.tables;

    let has_dp_data = true;
    let has_drr_data = true;

    if(subject.level === 'program'){
      has_dp_data = !subject.dead_program;
      has_drr_data = !subject.crso.is_cr;
    }

    if(subject.level === 'crso'){
      has_dp_data = !subject.dead_so;
      //there are some cases where an SO that died before pa_last_year can crash this graph...
      has_drr_data = _.some(subject.programs, prog => {
        const rows = table6.programs.get(prog);
        return !_.isEmpty(rows) && _.first(rows)["{{pa_last_year}}"] > 0;
      });
    }

    if(!has_dp_data && !has_drr_data){
      return false;
    }

    return {
      has_dp_data,
      has_drr_data,
    };

  },
  render(panel, calculations){
    const { 
      subject, 
      graph_args: {
        has_dp_data,
        has_drr_data,
      },
    } = calculations;

    const scheme = create_rooted_resource_scheme({subject});
    
    const node = panel.areas().graph.node();
    reactAdapter.render(
      <RootedResourceExplorerContainer 
        subject={subject} 
        has_dp_data={has_dp_data}
        has_drr_data={has_drr_data}
        rooted_resource_scheme={scheme}
        initial_resource_state={get_initial_resource_state({subject, has_dp_data, has_drr_data})}
      />, 
      node
    );

  },
});
