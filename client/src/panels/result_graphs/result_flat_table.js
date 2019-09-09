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
import { Details } from '../../components/Details.js';
import { 
  Indicator,
  ResultCounts,
  GranularResultCounts,
  result_docs,
} from './results_common.js';
import { StatusIconTable, InlineStatusIconList, Drr17IndicatorResultDisplay, IndicatorResultDisplay } from './result_components.js';
import { create_full_results_hierarchy } from '../../gen_expl/result_hierarchies.js'
import { single_subj_results_scheme, get_initial_single_subj_results_state } from '../../gen_expl/results_scheme.js';
const { SpinnerWrapper, Format, TextAbbrev } = util_components;
import { ensure_loaded } from '../../core/lazy_loader.js';
import { Result } from './results_common.js';
import { Subject } from '../../models/subject.js';
import { A11YTable } from '../../charts/A11yTable.js';


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

const indicator_table_from_list = (indicator_list, is_drr17) => {
  const table_data_headers = ["indicator", "target", "actual result", "status"];
  const FormattedIndicator = is_drr17 ? IndicatorResultDisplay : Drr17IndicatorResultDisplay;
  const table_data = _.map(indicator_list, ind => ({
    label: `${ind.parent_subject.data.name} (${ind.parent_subject.data.subject.level})`,
    data: [
      ind.indicator.name,
      <FormattedIndicator
        key={`${ind.indicator.id}_target`}
        doc={ind.indicator.doc}
        data_type={ind.indicator.target_type}
        min={ind.indicator.target_min}
        max={ind.indicator.target_max}
        narrative={ind.indicator.target_narrative}
        measure={ind.indicator.measure}
      />,
      <FormattedIndicator
        key={`${ind.indicator.id}_actual`}
        doc={ind.indicator.doc}
        data_type={ind.indicator.actual_datatype}
        min={ind.indicator.actual_result}
        max={ind.indicator.actual_result}
        narrative={ind.indicator.actual_result}
        measure={ind.indicator.measure}
      />,
      ind.indicator.status_key,
    ],
  }) );
  return <A11YTable data={table_data} label_col_header="subject" data_col_headers={table_data_headers}/>;
};


class ResultsTable extends React.Component {
  constructor(){
    super();

    this.state = {
      loading: true,
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
    const { loading } = this.state;

    if (loading) {
      return (
        <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {

      const doc = 'drr17';

      const flat_indicators = get_indicators(subject, doc);


      return (
        <div>
          {indicator_table_from_list(flat_indicators, doc==="drr17")}
        </div>
      )
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
