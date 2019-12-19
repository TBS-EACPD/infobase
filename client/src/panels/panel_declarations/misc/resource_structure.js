import '../../../gen_expl/explorer-styles.scss';
import text from './resource_structure.yaml';

import { combineReducers, createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { Fragment } from 'react';
import { Explorer } from '../../../components/ExplorerComponents.js';

import { infograph_href_template } from '../../../link_utils.js';
import { get_root } from '../../../gen_expl/hierarchy_tools.js';
import { get_col_defs } from '../../../gen_expl/resource-explorer-common.js';

import {
  declare_panel,
  InfographicPanel,
  create_text_maker_component,
  TabbedControls,
  Results,
  run_template,
} from "../shared.js";
import {
  create_rooted_resource_scheme,
  get_initial_resource_state,
} from '../../../gen_expl/rooted_resource_scheme.js';

import {
  get_memoized_funcs,
  initial_root_state,
  root_reducer,
  map_state_to_root_props_from_memoized_funcs,
  map_dispatch_to_root_props,
} from '../../../gen_expl/state_and_memoizing';


const { text_maker, TM } = create_text_maker_component(text);

const {
  current_drr_key,
  current_dp_key,
  result_docs,
} = Results;

const current_drr_doc = result_docs[current_drr_key];
const current_drr_resource_year_template = _.first(current_drr_doc.resource_years);
const current_dp_doc = result_docs[current_dp_key];
const current_dp_resource_year_template = _.first(current_dp_doc.resource_years);


const children_grouper = (node, children) => {
  //this one only has one depth, so the root must group its children
  return _.chain(children)
    .groupBy(child => child.data.header )
    .map( (node_group,header) => ({
      display: header,
      node_group,
    }))
    .value();
};

const get_non_col_content = ({node}) => {
  const {
    data: {
      defs,
      subject,
    },
  } = node;
  return (
    <div>
      {
        !_.isEmpty(defs) && 
        <dl className="dl-horizontal">
          {_.map(defs, ({ term, def }, ix) => 
            <Fragment key={ix}>
              <dt> { term } </dt>
              <dd> { def } </dd>
            </Fragment>)}
        </dl>
      }
      { ( //only tags with programs (i.e. not tags that are just group of tags) have infographics
        _.includes(['program', 'dept', 'crso'], subject.level) || 
        subject.level === 'tag' && 
        !_.isEmpty(subject.programs)
      ) && 
        <div className='ExplorerNode__BRLinkContainer'>
          <a href={infograph_href_template(subject)}> 
            <TM k="see_infographic" />
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
      subject,
      has_dp_data,
      has_drr_data,
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
        style={{position: 'relative'}}
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

    if(_.includes(["MLT", "CCOFOG", "WWH"], subject.root.id)){
      return inner_content;
    }
 
    const tab_on_click = (doc) => set_doc !== doc && set_doc(doc);

    return (
      <div className="tabbed-content">
        <TabbedControls
          tab_callback={ tab_on_click }
          tab_options={ _.compact([
            has_drr_data && {
              label: <TM k="actual_resources" args={{year: run_template(current_drr_resource_year_template)}} />,
              key: current_drr_key, 
              is_open: doc === current_drr_key,
            },
            has_dp_data && {
              key: current_dp_key, 
              label: <TM k="planned_resources" args={{year: run_template(current_dp_resource_year_template)}} />,
              is_open: doc === current_dp_key,
            },
          ])}
        />
        <div className="tabbed-content__pane">
          {inner_content}
        </div>
      </div>
    );
  }
}


const map_state_to_props_from_memoized_funcs = memoized_funcs => {

  const { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(memoized_funcs);

  return state => ({
    ...mapRootStateToRootProps(state),
    ...get_scheme_props(state),
  });
};
  

class RootedResourceExplorerContainer extends React.Component {
  render(){
    const { 
      rooted_resource_scheme: scheme,
      initial_rooted_resource_state,
      subject,
      has_dp_data,
      has_drr_data,
    } = this.props;

    const scheme_key = scheme.key;

    const reducer = combineReducers({
      root: root_reducer, 
      [scheme_key]: scheme.reducer,
    });

    const mapDispatchToProps = dispatch => ({
      ...map_dispatch_to_root_props(dispatch), 
      ...scheme.dispatch_to_props(dispatch),
    });

    const mapStateToProps = map_state_to_props_from_memoized_funcs(get_memoized_funcs([ scheme ]));

    const initialState = {
      root: ({...initial_root_state, scheme_key}),
      [scheme_key]: initial_rooted_resource_state,
    };

    const Container = connect(mapStateToProps, mapDispatchToProps)(RootedResourceExplorer);

    return (
      <Provider store={createStore(reducer,initialState)}>
        <Container
          scheme={scheme}
          subject={subject}
          has_dp_data={has_dp_data}
          has_drr_data={has_drr_data}
        />
      </Provider>
    );
  }
}


export const declare_resource_structure_panel = () => declare_panel({
  panel_key: "resource_structure",
  levels: ["tag"],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    depends_on: ['programSpending','programFtes'],
  
    calculate(subject){
      const { programSpending } = this.tables;
  
      const has_some_program_spending_for_year = (resource_year) => _.some(
        subject.programs,
        program => _.some(
          programSpending.programs.get(program),
          (row) => _.isNumber(row[resource_year]) && row[resource_year] !== 0
        )
      );

      const has_drr_data = current_drr_resource_year_template && has_some_program_spending_for_year(`${current_drr_resource_year_template}exp`);
      const has_dp_data = current_dp_resource_year_template && has_some_program_spending_for_year(current_dp_resource_year_template);

      return (has_dp_data || has_drr_data) && {
        has_dp_data,
        has_drr_data,
      };
    },
  
    render({calculations}){
      const { 
        subject, 
        panel_args: {
          has_dp_data,
          has_drr_data,
        },
      } = calculations;
  
      const scheme = create_rooted_resource_scheme({subject});
      
      return (
        <InfographicPanel 
          title={text_maker("resource_structure_title")}
        >
          <RootedResourceExplorerContainer 
            subject={subject} 
            has_dp_data={has_dp_data}
            has_drr_data={has_drr_data}
            rooted_resource_scheme={scheme}
            initial_rooted_resource_state={get_initial_resource_state({subject, has_dp_data, has_drr_data})}
          />
        </InfographicPanel>
      );
    },
  }),
});
