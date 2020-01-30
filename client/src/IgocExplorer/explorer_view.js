import '../explorer_common/explorer-styles.scss';
import { igoc_tmf as text_maker, TM } from './igoc_explorer_text.js';

import { Fragment } from 'react';
import { createSelector } from 'reselect';
import classNames from 'classnames';

import { get_root } from '../explorer_common/hierarchy_tools.js';
import { Explorer } from '../explorer_common/explorer_components.js';

import { infograph_href_template } from '../link_utils.js';
import { sanitized_dangerous_inner_html } from '../general_utils.js';
import {
  SpinnerWrapper,
  DlItem,
  CheckBox,
} from '../components/index.js';
import { Subject } from '../models/subject.js';

const { InstForm } = Subject;

function get_org_count(node){
  if( _.get(node, "data.type") === "org"){
    return 1;
  } else if( _.isEmpty(node.children) ){
    return 0; 
  } else {
    return _.chain(node.children)
      .map(child => get_org_count(child))
      .sum()
      .value();
  }
}

const SubjectFields = ({ subject, grouping }) => (
  <div style={{marginTop: "2em"}}>
    <dl className="dl-horizontal dl-no-bold-dts dl-really-long-terms">
      { _.nonEmpty(subject.applied_title) && subject.applied_title !== subject.legal_name &&
        <DlItem
          term={<TM k="applied_title" />}
          def={subject.applied_title}
        />
      }
      { _.nonEmpty(subject.old_name) && 
        <DlItem
          term={<TM k="previously_named" />}
          def={subject.old_name}
        />
      }
      { subject.is_dead && 
        <Fragment>
          <DlItem
            term={<TM k="status" />}
            def={subject.status}
          />
          <DlItem
            term={<TM k="end_yr" />}
            def={subject.end_yr}
          />
        </Fragment>
      }
      { _.nonEmpty(subject.ministers) && 
        <DlItem
          term={<TM k="padded_minister_span"/>}
          def={ _.map(subject.ministers,'name').join(", ") }
        />
      }
      { _.nonEmpty(subject.mandate) && 
        <DlItem
          term={<TM k="mandate" />}
          def={ <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(subject.mandate)} /> }
        />
      }
      { _.nonEmpty(subject.notes) && 
        <DlItem
          term={<TM k ="notes"/>}
          def={subject.notes}
        />
      }
    </dl>
  </div>
);


const inst_form_sort_order = [
  "min_dept",
  "dept_corp",
  "dept_agency",
  "serv_agency",
  "spec_op_agency",
  "parl_ent",
  "agents_parl",
  "crown_corp",
  "shared_gov_corp",
  "joint_enterprise",
  "inter_org",
  "other",
];

const react_html_string = str => <span dangerouslySetInnerHTML={{ __html: str }} />;
const get_col_defs = ({show_counts}) => [{
  id: "name",
  width: 250,
  textAlign: "left",
  get_val: (node) => {
    const {
      data: {
        name, 
        subject, 
        type,
      },
    } = node;

    if(type !== "org" && show_counts){
      return react_html_string(`${name} (${get_org_count(node)})`);
    } else if(subject && subject.end_yr){
      return react_html_string(`${name} (${subject.end_yr})`);
    } else {
      return react_html_string(name);
    }
  },
}];

const get_children_grouper = createSelector(
  _.property("grouping"),
  grouping => (node, children) => {
    const trivial_grouping = [{node_group: children}];
    if(node.root){
      return trivial_grouping;
    }

    if(grouping==="portfolio" && node.data.type === "ministry"){
      return _.chain(children)
        .groupBy('data.subject.inst_form.id')
        .toPairs()
        .sortBy( ([form_id]) => _.indexOf(inst_form_sort_order, form_id) )
        .map( ([form_id, node_group])=> ({
          display: InstForm.lookup(form_id).name,
          node_group,
        }))
        .value();
    } else {
      return trivial_grouping;
    }
  }
);

const get_non_col_content_func = createSelector(
  _.property('grouping'),
  grouping => ({node}) => {
    const {
      data: {
        subject,
      },
    } = node;

    return (
      <div>
        { subject && 
          <div>
            <SubjectFields {...{grouping, subject}} />
          </div>
        }
        {subject && 
          <div className="ExplorerNode__BRLinkContainer">
            <a 
              className="btn btn-xs btn-ib-light" 
              href={infograph_href_template(subject)}
            > 
              <TM k="see_infographic" />    
            </a>
          </div>
        }
      </div>
    );
  }
);

class ExplorerForIgoc extends React.Component {
  constructor(){
    super();
    this.state = { _query: "" };
    this.debounced_set_query = _.debounce(this.debounced_set_query, 500);
  }
  handleQueryChange(new_query){
    this.setState({
      _query: new_query,
      loading: new_query.length > 3 ? true : undefined,
    });
    this.debounced_set_query(new_query);
  } 
  debounced_set_query(new_query){
    this.props.set_query(new_query);
    this.timedOutStateChange = setTimeout(()=>{
      this.setState({
        loading: false,
      });
    }, 500);
  }
  componentWillUnmount(){
    !_.isUndefined(this.debounced_set_query) && this.debounced_set_query.cancel();
    !_.isUndefined(this.timedOutStateChange) && clearTimeout(this.timedOutStateChange);
  }
  clearQuery(){
    this.setState({_query: ""});
    this.props.clear_query("");
  }
  render(){
    const {
      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,

      //scheme props
      grouping,
      should_show_orgs_without_data,

      on_toggle_orgs_without_data,

    } = this.props;

    const { loading } = this.state;

    const root = get_root(flat_nodes);
    
    const org_count = _.countBy(flat_nodes, node => _.isEmpty(node.children)).true;

    const explorer_config = {
      children_grouper: get_children_grouper({grouping}),
      column_defs: get_col_defs({show_counts: !is_filtering}),
      shouldHideHeader: true,
      zebra_stripe: true,
      onClickExpand: id => toggle_node(id),
      get_non_col_content: get_non_col_content_func({grouping}),
    };

    return <div>
      <div>
        <ul className="nav nav-justified nav-pills">
          <li className={classNames(grouping==='portfolio' && 'active')}><a href="#igoc/portfolio" > <TM k="by_ministry" /> </a></li>
          <li className={classNames(grouping==='inst_form' && 'active')}><a href="#igoc/inst_form" > <TM k="by_inst_form" /> </a></li>
          <li className={classNames(grouping==='historical' && 'active')}><a href="#igoc/historical" > <TM k="by_historical" /></a></li>
          <li className={classNames(grouping==='pop_group' && 'active')}><a href="#igoc/pop_group" > <TM k="by_pop_group" /></a></li>
          <li className={classNames(grouping==='all' && 'active')}><a href="#igoc/all" > <TM k="all_orgs" /></a></li>
        </ul>
      </div>
      <div
        style={{
          margin: '15px 0',
        }}
      >
        <form
          style={{marginBottom: "5px"}}
          onSubmit={evt => {
            evt.preventDefault();
            evt.stopPropagation();
            set_query(evt.target.querySelector('input').value);
            this.refs.focus_mount.focus();
          }}
        >
          <input 
            aria-label={text_maker("explorer_search_is_optional")}            
            className="form-control input-lg"
            type="text"
            style={{width: "100%"}}
            placeholder={text_maker('igoc_search_text')}
            onChange={evt => this.handleQueryChange(evt.target.value)}

          />
          {
            window.is_a11y_mode &&
            <input 
              type="submit"
              name="search"
              value={text_maker("explorer_search")}
            />
          }
        </form>
        <div className="igoc-checkbox-and-count-row">
          <CheckBox
            id={"show_orgs_without_data"}
            active={should_show_orgs_without_data}
            onClick={on_toggle_orgs_without_data}
            label={text_maker("show_orgs_without_data")}
            checkMark_vertical_align={6}
            checkbox_style={{ marginTop: 4 }}
          />
          <div>
            <TM k="displayed_orgs_count" args={{org_count}}/>
          </div>
        </div>
      </div>
      <div 
        tabIndex={-1}
        className="explorer-focus-mount"
        ref="focus_mount" 
        style={{position: 'relative'}}
        aria-label={text_maker("explorer_focus_mount")}
      >
        {loading && 
          <div className="loading-overlay">
            <div style={{height: '200px',position: 'relative'}}>
              <SpinnerWrapper config_name={"sub_route"} /> 
            </div>
          </div>
        }
        {is_filtering && _.isEmpty(root.children) &&
          <div style={{fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center'}}>  
            <TM k="search_no_results" />
          </div>
        }
        <Explorer
          config={explorer_config}
          root={root}
        />
      </div>
    </div>;
 

  }
}

export { ExplorerForIgoc };
