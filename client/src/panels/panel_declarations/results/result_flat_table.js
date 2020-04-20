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
    .filter(node => node.data.type === "indicator")
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
  const subject_link_map = _.chain(indicator_list)
    .map(ind => [ind.parent_node.data.name, subject_link(ind.parent_node)])
    .fromPairs()
    .value();
  const indicator_id_map = _.chain(indicator_list)
    .map(ind => [ind.indicator.name, `#indicator/${ind.indicator.id}`])
    .fromPairs()
    .value();
  const column_configs = {
    cr_or_program: {
      index: 0,
      header: text_maker("cr_or_program"),
      is_sortable: true,
      is_searchable: true,
      formatter: (value) => subject_link_map[value],
    },
    indicator: {
      index: 1,
      header: text_maker("indicator"),
      is_sortable: true,
      is_searchable: true,
      formatter: (value) => <a href={indicator_id_map[value]}> {value} </a>,
    },
    target: {
      index: 2,
      header: text_maker("target"),
    },
    target_result: {
      index: 3,
      header: text_maker("target_result"),
    },
    date_to_achieve: {
      index: 4,
      header: text_maker("date_to_achieve"),
      is_sortable: true,
      sort_func: (value) => new Date(value),
    },
    status: {
      index: 5,
      header: text_maker("status"),
      is_sortable: true,
      formatter: (value) => <Fragment>
        <span aria-hidden="true" className="copyable-hidden">{result_statuses[value].text}</span>
        {window.innerWidth < breakpoints.mediumDevice ? status_icons[value] : large_status_icons[value]}
      </Fragment>,
    },
  };

  const table_data = _.map(indicator_list, ind => ({
    cr_or_program: ind.parent_node.data.name,
    indicator: ind.indicator.name,
    target: indicator_target_text(ind.indicator),
    target_result: indicator_actual_text(ind.indicator),
    date_to_achieve: ind.indicator.target_date,
    status: ind.indicator.status_key,
  }));
  console.log(table_data);
  return <DisplayTable 
    table_name={text_maker("result_flat_table_title", {year: current_drr_year})}
    data={table_data}
    column_configs={column_configs}
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
    footnotes: ["DRR_RESULTS"],
    depends_on: ["programSpending", "programFtes"],
    source: (subject) => get_source_links(["DRR"]),
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

    render({calculations, sources, footnotes}){
      const { 
        subject, 
        panel_args: {
          docs_with_data,
          last_drr_doc,
          subject_result_counts,
        },
      } = calculations;

      return (
        <InfographicPanel title={text_maker("result_flat_table_title", {year: current_drr_year})} sources={sources} footnotes={footnotes}>
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
