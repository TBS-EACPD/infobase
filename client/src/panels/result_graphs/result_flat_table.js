import { Fragment } from 'react';
import { TM, text_maker } from './result_text_provider.js';
import { 
  util_components, 
  Panel,
} from '../shared.js';
import { get_static_url } from '../../request_utils.js';
import { DisplayTable } from '../../components/DisplayTable.js';
import { 
  ResultCounts,
  GranularResultCounts,
  status_key_to_svg_name,
  result_docs,
  ordered_status_keys,
  result_statuses,
} from './results_common.js';
import { StatusIconTable, Drr17IndicatorResultText, IndicatorResultText } from './result_components.js';
import { create_full_results_hierarchy } from '../../gen_expl/result_hierarchies.js';
const { SpinnerWrapper } = util_components;
import { ensure_loaded } from '../../core/lazy_loader.js';
import { SubProgramEntity } from '../../models/results.js';
import {
  get_source_links, 
  declare_panel,
} from '../shared.js';


const get_svg_url = (status_key) => get_static_url(`svg/${status_key_to_svg_name[status_key]}.svg`);


const get_actual_parent = (indicator_node, full_results_hierarchy) => {
  const parent = _.find(full_results_hierarchy, {id: indicator_node.parent_id});
  if(parent.data.type === "cr" || parent.data.type === "program" || parent.data.type === "sub_program" || parent.data.type === "sub_sub_program") {
    //console.log(`found parent: ${parent.data.name}`);
    return parent;
  } else if(parent.data.type === "dr" || parent.data.type === "result"){
    //console.log(`parent not found yet, recursing`);
    return get_actual_parent(parent, full_results_hierarchy);
  } else {
    //console.log("error, couldn't find parent");
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
    Drr17IndicatorResultText({ // these need to be called because they will be sorted on
      data_type: indicator.target_type,
      min: indicator.target_min,
      max: indicator.target_max,
      narrative: indicator.target_narrative,
      measure: indicator.measure,
    }) :
    IndicatorResultText({
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
    Drr17IndicatorResultText({
      data_type: indicator.actual_datatype,
      min: indicator.actual_result,
      max: indicator.actual_result,
      narrative: indicator.actual_result,
      measure: indicator.measure,
    }) :
    IndicatorResultText({ // TODO: probably should be DRR17
      doc: indicator.doc,
      data_type: indicator.actual_datatype,
      min: indicator.actual_result,
      max: indicator.actual_result,
      narrative: indicator.actual_result,
      measure: indicator.measure,
    });
};



const status_icon_style = {width: "41px", height: "41px"};

const subject_link = (subject) => {
  if (subject.data.subject.level === "sub_program" || subject.data.subject.level === "sub_sub_program"){
    const href_subject_id = subject.data.subject.level === "sub_program" ?
      subject.data.subject.parent_id :
      SubProgramEntity.lookup(subject.data.subject.parent_id).parent_id;
    return (
      <span>
        <a href={`#orgs/program/${href_subject_id}/infograph/results`}>
          {subject.data.name}
        </a>
        {" "}
        <span className='text-nowrap'>
          (
          {text_maker(subject.data.subject.level)}
          <span className="tag-glossary-item">
            <img className="tag-glossary-icon"
              width={18}
              aria-hidden="true"
              src={get_static_url('svg/not-available-white.svg')} 
              tabIndex="0"
              data-toggle="tooltip"
              data-ibtt-glossary-key={"SSP"}
              data-ibtt-html="true"
            />
          </span>
          )
        </span>
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
        <img key={ind.indicator.status_key} src={get_svg_url(ind.indicator.status_key)} style={status_icon_style} />
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
      status_filtered: _.zipObject(ordered_status_keys, _.map(ordered_status_keys, ()=>false)),
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
    } = this.props;
    const { loading, status_filtered } = this.state;
    
    if (loading) {
      return (
        <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      const doc = 'drr17';
      const flat_indicators = get_indicators(subject, doc);
      const icon_counts = _.zipObject(ordered_status_keys,
        _.map(ordered_status_keys,
          key => _.reduce(flat_indicators, (sum,ind) => sum + (ind.indicator.status_key === key) || 0, 0)
        ));
      const filtered_indicators = _.filter(flat_indicators, ind => !status_filtered[ind.indicator.status_key]);
      const toggle_status_status_key = (status_key) => {
        const current_status_filtered = _.clone(status_filtered);
        current_status_filtered[status_key] = !current_status_filtered[status_key];
        this.setState({status_filtered: current_status_filtered});
      };

      const active_list = _.filter(ordered_status_keys, key => !status_filtered[key]);

      return (
        <div>
          <div className="medium_panel_text">
            <TM k="result_flat_table_text" args={{subject, ...subject_result_counts}}/>
          </div>
          <div style={{
            padding: '10px 10px',
            marginTop: "20px",
            marginBottom: "20px",
          }}>
            <StatusIconTable 
              active_list={active_list}
              icon_counts={icon_counts} 
              onIconClick={toggle_status_status_key}
            />
          </div>
          <div className="results-flat-table">
            {indicator_table_from_list(filtered_indicators, !subject.is_first_wave && doc === 'drr17')}
          </div>
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


      if( _.isEmpty(docs_with_data) ){
        return false;
      }

      return { docs_with_data, subject_result_counts };
    },

    render({calculations, sources}){
      const { 
        subject, 
        graph_args: {
          docs_with_data,
          subject_result_counts,
        },
      } = calculations;

      const year_range_with_data = _.chain(docs_with_data)
        .map( doc => result_docs[doc].year)
        .thru( 
          years_with_data => ({
            first_year: years_with_data[0],
            last_year: years_with_data.length > 1 && _.last(years_with_data),
          })
        )
        .value();


      return (
        <Panel title={text_maker("result_flat_table_title")} sources={sources}>
          <ResultsTable
            {...{
              subject,
              docs_with_data,
              subject_result_counts,
            }}
          />
        </Panel>
      );

    },
  }),
});
