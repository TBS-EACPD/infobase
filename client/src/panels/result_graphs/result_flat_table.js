import { TM, text_maker } from './result_text_provider.js';
import classNames from 'classnames';
import { 
  PanelGraph, 
  util_components, 
  infograph_href_template, 
  Panel,
  TabbedControls,
  DlItem,
  get_source_links,
} from '../shared.js';
import { get_static_url } from '../../request_utils.js';
import { Details } from '../../components/Details.js';
import { DisplayTable } from '../../components/DisplayTable.js';
import { 
  Indicator,
  ResultCounts,
  GranularResultCounts,
  status_key_to_svg_name,
  result_docs,
  ordered_status_keys,
} from './results_common.js';
import { StatusIconTable, InlineStatusIconList, Drr17IndicatorResultText, IndicatorResultText } from './result_components.js';
import { create_full_results_hierarchy } from '../../gen_expl/result_hierarchies.js'
import { single_subj_results_scheme, get_initial_single_subj_results_state } from '../../gen_expl/results_scheme.js';
const { SpinnerWrapper, Format, TextAbbrev } = util_components;
import { ensure_loaded } from '../../core/lazy_loader.js';
import { Result } from './results_common.js';
import { Subject } from '../../models/subject.js';
import { SubProgramEntity } from '../../models/results.js';
import { A11YTable } from '../../charts/A11yTable.js';


const get_svg_url = (status_key) => get_static_url(`svg/${status_key_to_svg_name[status_key]}.svg`);

const { Dept, CRSO, Program } = Subject;

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
    return <span>
      <a href={`#orgs/program/${href_subject_id}/infograph/results`}>{subject.data.name}</a>
      {` (${text_maker(subject.data.subject.level)}`}
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
      </span>)
    </span>;
  } else {
    return <span><a href={`#orgs/program/${subject.data.subject.id}/infograph/results`}>{subject.data.name}</a> ({text_maker(subject.data.subject.level === "program" ? subject.data.subject.level : "core_resp")})</span>;
  }
};





const indicator_table_from_list = (indicator_list, is_drr17) => {
  const column_keys = ["indicator","result_data_type","target","target_result","status"];
  const sort_keys = ["indicator", "result_data_type", "status"];
  const table_data_headers = _.map(column_keys, k => text_maker(k));
  const table_data = _.map(indicator_list, ind => ({
    label: subject_link(ind.parent_subject),
    col_data: {
      indicator: ind.indicator.name,
      result_data_type: ind.indicator.target_type,
      target: formatted_target(ind.indicator, is_drr17),
      target_result: formatted_actual(ind.indicator, true),
      status: <img key={ind.indicator.status_key} src={get_svg_url(ind.indicator.status_key)} style={status_icon_style} />,
    },
    sort_keys: {
      label: ind.parent_subject.data.name,
      indicator: ind.indicator.name,
      result_data_type: ind.indicator.target_type,
      status: _.indexOf(ordered_status_keys, ind.indicator.status_key),
    },
  }) );
  return <DisplayTable data={table_data} label_col_header="" column_keys={column_keys} table_data_headers={table_data_headers} sort_keys={sort_keys} table_name="TODO"/>;
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
      docs_with_data,
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
      const filtered_indicators =  _.filter(flat_indicators, ind => !status_filtered[ind.indicator.status_key]);
      const toggle_status_status_key = (status_key) => {
        const current_status_filtered = _.clone(status_filtered);
        current_status_filtered[status_key] = !current_status_filtered[status_key];
        this.setState({status_filtered: current_status_filtered});
      };

      const active_list = _.filter(ordered_status_keys, key => !status_filtered[key]);

      return (
        <div>
          <StatusIconTable 
            active_list={active_list}
            icon_counts={icon_counts} 
            onIconClick={toggle_status_status_key}
          />
          <div className="results-flat-table">
            {indicator_table_from_list(filtered_indicators, !subject.is_first_wave && doc === 'drr17')}
          </div>
        </div>
      );
    }

  }
}

_.each(['program','dept','crso'], lvl => {
  new PanelGraph({
    level: lvl,
    footnotes: false,
    depends_on: ["programSpending", "programFtes"],
    source: (subject) => get_source_links(["DP","DRR"]),
    requires_result_counts: lvl === 'dept',
    requires_granular_result_counts: lvl !== 'dept',
    key: "results_flat_table",
    calculate(subject){
      const subject_result_counts = lvl === 'dept' ?
        ResultCounts.get_dept_counts(subject.id) :
        GranularResultCounts.get_subject_counts(subject.id);

      const had_doc_data = (doc) => {
        const count_key = /drr/.test(doc) ? `${doc}_total` : `${doc}_indicators`;
        return (
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

      return { docs_with_data };
    },

    render({calculations, sources}){
      const { 
        subject, 
        graph_args: {
          docs_with_data,
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
        <Panel title={text_maker("result_drilldown_title", { ...year_range_with_data })} sources={sources}>
          <ResultsTable
            {...{
              subject,
              docs_with_data,
            }}
          />
        </Panel>
      );

    },
  });

});
