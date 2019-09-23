import { Fragment } from 'react';
import { TM, text_maker } from './result_text_provider.js';
import { 
  util_components, 
  Panel,
  HeightClippedGraph,
} from '../shared.js';
import { get_static_url } from '../../request_utils.js';
import { DisplayTable } from '../../components/DisplayTable.js';
import { 
  ResultCounts,
  GranularResultCounts,
  result_docs,
  ordered_status_keys,
  result_statuses,
} from './results_common.js';
import {
  StatusIconTable,
  drr17_indicator_result_text,
  indicator_result_text,
  large_status_icons,
} from './result_components.js';
import { create_full_results_hierarchy } from '../../gen_expl/result_hierarchies.js';
const { SpinnerWrapper } = util_components;
import { ensure_loaded } from '../../core/lazy_loader.js';
import { SubProgramEntity } from '../../models/results.js';
import { Subject } from '../../models/subject.js';
const { Program } = Subject;
import {
  get_source_links, 
  declare_panel,
} from '../shared.js';


const get_actual_parent = (indicator_node, full_results_hierarchy) => {
  const parent = _.find(full_results_hierarchy, {id: indicator_node.parent_id});
  if(parent.data.type === "cr" || parent.data.type === "program" || parent.data.type === "sub_program" || parent.data.type === "sub_sub_program") {
    return parent;
  } else if(parent.data.type === "dr" || parent.data.type === "result"){
    return get_actual_parent(parent, full_results_hierarchy);
  } else {
    if (window.is_dev) {
      /* eslint-disable no-console */
      console.error(`result component ${indicator_node} with no parent`);
    }
    return;
  }
};

const get_indicators = (subject, doc) => {
  const full_results_hierarchy = create_full_results_hierarchy({subject_guid: subject.guid, doc, allow_no_result_branches: false});
  return _.chain(full_results_hierarchy)
    .filter(node => node.data.type==="indicator")
    .map( indicator_node => ({ ...indicator_node.data, parent_subject: get_actual_parent(indicator_node, full_results_hierarchy) }) )
    .value();
};

const formatted_target = (indicator, is_drr17) => {
  return is_drr17 ?
    drr17_indicator_result_text({
      data_type: indicator.target_type,
      min: indicator.target_min,
      max: indicator.target_max,
      narrative: indicator.target_narrative,
      measure: indicator.measure,
    }) :
    indicator_result_text({
      doc: indicator.doc,

      data_type: indicator.target_type,
      min: indicator.target_min,
      max: indicator.target_max,
      narrative: indicator.target_narrative,
      measure: indicator.measure,
    });
};

const formatted_actual = (indicator, is_drr17) => {
  return is_drr17 ?
    drr17_indicator_result_text({
      data_type: indicator.actual_datatype,
      min: indicator.actual_result,
      max: indicator.actual_result,
      narrative: indicator.actual_result,
      measure: indicator.measure,
    }) :
    indicator_result_text({ // TODO: probably should be DRR17
      doc: indicator.doc,
      data_type: indicator.actual_datatype,
      min: indicator.actual_result,
      max: indicator.actual_result,
      narrative: indicator.actual_result,
      measure: indicator.measure,
    });
};




const subject_link = (subject) => {
  if (subject.data.subject.level === "sub_program" || subject.data.subject.level === "sub_sub_program"){
    const program_id = subject.data.subject.level === "sub_program" ?
      subject.data.subject.parent_id :
      SubProgramEntity.lookup(subject.data.subject.parent_id).parent_id;
    const program_name = Program.lookup(program_id).name;
    return (
      <span>
        {subject.data.name}
        {" (a "}
        <span
          className="nowrap glossary-tooltip-link"
          tabIndex={0}
          aria-hidden="true"
          data-toggle="tooltip"
          data-ibtt-glossary-key="SSP"
          data-ibtt-html="true"
          data-ibtt-container="body"
        >
          {text_maker(subject.data.subject.level)}
        </span>
        {` ${text_maker("of")} `}
        <a href={`#orgs/program/${program_id}/infograph/results`}>
          {program_name}
        </a>
        )
      </span>
    );
  } else {
    return (
      <span>
        <a href={`#orgs/${subject.data.subject.level}/${subject.data.subject.id}/infograph/results`}>
          {subject.data.name}
        </a>
        {" "}
        <span className='text-nowrap'>
          ({text_maker(subject.data.subject.level === "program" ? subject.data.subject.level : "core_resp")})
        </span>
      </span>
    );
  }
};





const indicator_table_from_list = (indicator_list, is_drr17) => {
  const column_keys = ["indicator","target","target_result","date_to_achieve","status"];
  const sort_keys = ["indicator","date_to_achieve", "status"];
  const table_data_headers = _.map(column_keys, k => text_maker(k));
  const table_data = _.map(indicator_list, ind => ({
    label: subject_link(ind.parent_subject),
    col_data: {
      indicator: ind.indicator.name,
      target: formatted_target(ind.indicator, is_drr17),
      target_result: formatted_actual(ind.indicator, true),
      date_to_achieve: ind.indicator.target_date,
      status: <Fragment>
        <span aria-hidden="true" style={{position: "absolute", left: "-999em"}}>{result_statuses[ind.indicator.status_key].text}</span>
        {large_status_icons[ind.indicator.status_key]}
      </Fragment>,
    },
    sort_keys: {
      label: ind.parent_subject.data.name,
      indicator: ind.indicator.name,
      date_to_achieve: ind.indicator.target_year ? ind.indicator.target_year + ind.indicator.target_month/12 : 9999999,
      status: _.indexOf(ordered_status_keys, ind.indicator.status_key),
    },
  }) );
  return <DisplayTable data={table_data} label_col_header={text_maker("activity")} column_keys={column_keys} table_data_headers={table_data_headers} sort_keys={sort_keys} table_name="TODO"/>;
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
      docs_with_data,
    } = this.props;

    ensure_loaded({
      subject,
      results: true,
      result_docs: docs_with_data,
    })
      .then( () => this.setState({loading: false}) );
  }
  render(){
    const { 
      subject,
      subject_result_counts,
      drr_doc,
    } = this.props;
    const { loading, status_active_list } = this.state;
    
    if (loading) {
      return (
        <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      const flat_indicators = get_indicators(subject, drr_doc);
      const icon_counts = _.zipObject(ordered_status_keys,
        _.map(ordered_status_keys,
          key => _.reduce(flat_indicators, (sum,ind) => sum + (ind.indicator.status_key === key) || 0, 0)
        ));
      const filtered_indicators = _.filter(flat_indicators, ind => _.isEmpty(status_active_list) || _.includes(status_active_list,ind.indicator.status_key));
      const toggle_status_status_key = (status_key) => this.setState({status_active_list: _.toggle_list(status_active_list, status_key)});
      const clear_status_filter = () => this.setState({status_active_list: []});
      
      return (
        <div>
          <div className="medium_panel_text">
            <TM k="result_flat_table_text" args={{subject, ...subject_result_counts}}/>
          </div>
          <HeightClippedGraph clipHeight={700}>
            <div style={{padding: '10px 10px'}}>
              <StatusIconTable 
                active_list={status_active_list}
                icon_counts={icon_counts} 
                onIconClick={toggle_status_status_key}
                onClearClick={clear_status_filter}
              />
            </div>
            <div className="results-flat-table">
              {indicator_table_from_list(filtered_indicators, !subject.is_first_wave && drr_doc === 'drr17')}
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

      const drr_doc = _.chain(docs_with_data)
        .filter(doc => /drr/.test(doc))
        .sort()
        .last()
        .value(); // TODO: make sure this works properly for drr18

      if( _.isEmpty(docs_with_data) ){
        return false;
      }

      return { docs_with_data, subject_result_counts, drr_doc };
    },

    render({calculations, sources}){
      const { 
        subject, 
        graph_args: {
          docs_with_data,
          drr_doc,
          subject_result_counts,
        },
      } = calculations;

      return (
        <Panel title={text_maker("result_flat_table_title")} sources={sources}>
          <ResultsTable
            {...{
              subject,
              docs_with_data,
              drr_doc,
              subject_result_counts,
            }}
          />
        </Panel>
      );

    },
  }),
});
