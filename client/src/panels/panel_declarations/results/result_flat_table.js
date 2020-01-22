import './result_flat_table.scss';

import { Fragment } from 'react';

import { TM, text_maker } from './result_text_provider.js';
import { 
  util_components, 
  InfographicPanel,
  breakpoints,
  ensure_loaded,
  infograph_href_template,
  get_source_links,
  Results,

  declare_panel,

  HeightClippedGraph,
} from '../shared.js';
const { SpinnerWrapper, DisplayTable } = util_components;

const { current_drr_key } = Results;

import {
  StatusIconTable,
  status_icons,
  large_status_icons,
} from './result_components.js';
import { 
  ResultCounts,
  GranularResultCounts,
  result_docs,
  ordered_status_keys,
  result_statuses,
  indicator_text_functions,
} from './results_common.js';
const {
  indicator_target_text,
  indicator_actual_text,
} = indicator_text_functions;

import { create_full_results_hierarchy } from './result_drilldown/result_hierarchies.js';

const current_drr_year = result_docs[current_drr_key].year;

const get_actual_parent = (indicator_node, full_results_hierarchy) => {
  const parent = _.find(full_results_hierarchy, {id: indicator_node.parent_id});
  if(_.includes(["cr", "program"], parent.data.type)) {
    return parent;
  } else if(parent.data.type === "dr" || parent.data.type === "result"){
    return get_actual_parent(parent, full_results_hierarchy);
  } else {
    throw `Result component ${indicator_node} has no (sub)program or CR parent`;
  }
};

const get_indicators = (subject, doc) => {
  const full_results_hierarchy = create_full_results_hierarchy({subject_guid: subject.guid, doc, allow_no_result_branches: false});
  return _.chain(full_results_hierarchy)
    .filter(node => node.data.type==="indicator")
    .map( indicator_node => ({ ...indicator_node.data, parent_node: get_actual_parent(indicator_node, full_results_hierarchy) }) )
    .value();
};


const subject_link = (node) => (
  <span>
    <a href={infograph_href_template(node.data.subject,"results")}>
      {node.data.name}
    </a>
    {" "}
    <span className='text-nowrap'>
      ({text_maker(node.data.subject.level === "program" ? node.data.subject.level : "core_resp")})
    </span>
  </span>
);


const indicator_table_from_list = (indicator_list) => {
  const column_keys = ["activity","indicator","target","target_result","date_to_achieve","status"];
  const sort_keys = ["activity","indicator","date_to_achieve", "status"];
  const table_data_headers = _.map(column_keys, k => text_maker(k));
  const table_data = _.map(indicator_list, ind => ({
    col_data: {
      activity: subject_link(ind.parent_node),
      indicator: <a href={`#indicator/${ind.indicator.id}`}>{ind.indicator.name}</a>,
      target: indicator_target_text(ind.indicator),
      target_result: indicator_actual_text(ind.indicator),
      date_to_achieve: ind.indicator.target_date,
      status: <Fragment>
        <span aria-hidden="true" className="copyable-hidden">{result_statuses[ind.indicator.status_key].text}</span>
        {window.innerWidth < breakpoints.mediumDevice ? status_icons[ind.indicator.status_key] : large_status_icons[ind.indicator.status_key]}
      </Fragment>,
    },
    sort_keys: {
      activity: ind.parent_node.data.name,
      indicator: ind.indicator.name,
      date_to_achieve: ind.indicator.target_year ? ind.indicator.target_year + ind.indicator.target_month/12 : Infinity,
      status: _.indexOf(ordered_status_keys, ind.indicator.status_key),
    },
  }) );
  return <DisplayTable 
    data={table_data}
    label_col_header={text_maker("cr_or_program")}
    column_keys={column_keys}
    table_data_headers={table_data_headers}
    sort_keys={sort_keys}
    col_search_keys={["activity","indicator"]}
    table_name={text_maker("result_flat_table_title", {year: current_drr_year})}
  />;
};


class ResultsTable extends React.Component {
  constructor(){
    super();

    this.state = {
      loading: true,
      status_active_list: [],
    };
  }
  componentDidMount(){
    const { 
      subject,
      last_drr_doc,
    } = this.props;

    ensure_loaded({
      subject,
      results: true,
      result_docs: [last_drr_doc],
    })
      .then( () => this.setState({loading: false}) );
  }
  render(){
    const { 
      subject,
      subject_result_counts,
      last_drr_doc,
    } = this.props;
    const { loading, status_active_list } = this.state;

    if (loading) {
      return (
        <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      const flat_indicators = get_indicators(subject, last_drr_doc);
      const icon_counts = _.countBy(flat_indicators, ({indicator}) => indicator.status_key);
      const filtered_indicators = _.filter(flat_indicators, ind => _.isEmpty(status_active_list) || _.includes(status_active_list,ind.indicator.status_key));
      const toggle_status_status_key = (status_key) => this.setState({status_active_list: _.toggle_list(status_active_list, status_key)});
      const clear_status_filter = () => this.setState({status_active_list: []});
      
      return (
        <div>
          <div className="medium_panel_text">
            <TM k="result_flat_table_text" args={{ subject, drr_total: subject_result_counts[`${current_drr_key}_total`], year: current_drr_year }}/>
          </div>
          <div style={{padding: '10px 10px'}}>
            <StatusIconTable 
              active_list={status_active_list}
              icon_counts={icon_counts} 
              onIconClick={toggle_status_status_key}
              onClearClick={clear_status_filter}
            />
          </div>
          <HeightClippedGraph clipHeight={200}>
            <div className="results-flat-table">
              {indicator_table_from_list(filtered_indicators)}
            </div>
          </HeightClippedGraph>
        </div>
      );
    }

  }
}

export const declare_results_table_panel = () => declare_panel({
  panel_key: "results_flat_table",
  levels: ["dept", "crso", "program"],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    depends_on: ["programSpending", "programFtes"],
    source: (subject) => get_source_links(["DP","DRR"]),
    requires_result_counts: level === 'dept',
    requires_granular_result_counts: level !== 'dept',
    calculate(subject){
      const subject_result_counts = level === 'dept' ?
        ResultCounts.get_dept_counts(subject.id) :
        GranularResultCounts.get_subject_counts(subject.id);

      const had_doc_data = (doc) => {
        const count_key = `${doc}_total`;
        return (
          /drr/.test(doc) &&
          !_.isUndefined(subject_result_counts) && 
          !_.isNull(subject_result_counts[count_key]) && 
          subject_result_counts[count_key] > 0
        );
      };

      const docs_with_data = _.chain(result_docs)
        .keys()
        .filter( had_doc_data )
        .value();

      const last_drr_doc = _.chain(docs_with_data)
        .sort()
        .last()
        .value();

      if( _.isEmpty(docs_with_data) ){
        return false;
      }

      return { docs_with_data, subject_result_counts, last_drr_doc };
    },

    render({calculations, sources}){
      const { 
        subject, 
        panel_args: {
          docs_with_data,
          last_drr_doc,
          subject_result_counts,
        },
      } = calculations;

      return (
        <InfographicPanel title={text_maker("result_flat_table_title", {year: current_drr_year})} sources={sources}>
          <ResultsTable
            {...{
              subject,
              docs_with_data,
              last_drr_doc,
              subject_result_counts,
            }}
          />
        </InfographicPanel>
      );
    },
  }),
});
