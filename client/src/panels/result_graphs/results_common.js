import { Table } from '../../core/TableClass.js';
import { text_maker } from './result_text_provider.js';
import { formats } from '../../core/format.js';
import { 
  Result, 
  Indicator, 
  SubProgramEntity, 
  ResultCounts,
  GranularResultCounts,
  status_key_to_glossary_key,
  ordered_status_keys,
  result_docs,
  get_result_doc_keys,
} from '../../models/results.js';
import { compute_counts_from_set } from '../../models/result_counts.js';
import { infograph_href_template } from '../../link_utils.js';
const link_to_results_infograph = subj => infograph_href_template(subj, 'results');
import { businessConstants } from '../../models/businessConstants';

const {
  result_statuses,
  result_simple_statuses,
} = businessConstants;

function pick_table(subject,type,doc){
  return Table.lookup(
    type === "spending" ?
      "programSpending" :
      "programFtes"
  );
}

const get_rows_for_subject_from_table = _.memoize( (subject, type,doc) => {
  const table = pick_table(subject, type,doc);
  if( subject.level === 'program'){
    const rows_or_record = table.programs.get(subject);
    if(!rows_or_record){
      return null;
    }
    if(_.isArray(rows_or_record)){ 
      return rows_or_record;
    } else {
      return [ rows_or_record ];
    }
  } else if( /dp/.test(doc) && _.includes(["dept", "crso"], subject.level)){
    return table.q(subject).data;
  } else if(!_.isEmpty(subject.programs)){
    return _.chain(subject.programs)
      .map(prog => get_rows_for_subject_from_table(prog, type, doc) )
      .flatten()
      .value();
  } else if(subject.level === 'ministry'){
    return _.chain(subject.orgs)
      .map(org => get_rows_for_subject_from_table(org, type, doc) )
      .flatten(true)
      .compact()
      .value();
  } else if(!_.isEmpty(subject.children_tags)){
    return _.chain(subject.children_tags)
      .map(tag => get_rows_for_subject_from_table(tag, type, doc) )
      .flatten(true)
      .uniqBy()
      .compact()
      .value();
  } else {
    return null;
  }

}, (subject,type,doc) => `${subject.guid}-${type}-${doc}` );

const get_planning_data_for_subject_from_table = (subject, type, doc) => {
  const rows = get_rows_for_subject_from_table(subject,type,doc);
  const table = pick_table(subject,type,doc);

  let col;
  if(doc === "drr17"){
    col = "{{pa_last_year}}";
    if(type==="spending"){
      col = "{{pa_last_year}}exp";
    }
  } else {
    col = "{{planning_year_1}}";
  }

  return table.col_from_nick(col).formula(rows);
};

const planned_resource_fragment = (subject, doc) => {
  const spending = get_planning_data_for_subject_from_table(subject, "spending", doc);
  const ftes = get_planning_data_for_subject_from_table(subject, "fte", doc);

  return {
    spending,
    ftes,
  }; 
};

const isDeptWithoutResults = (subject) => _.chain(subject.programs)
  .map(prog => _.isEmpty(Result.get_entity_results(prog.id)) )
  .every()
  .value();

const row_to_drr_status_counts = ({
  drr17_indicators_met: met,
  drr17_indicators_not_met: not_met,
  drr17_indicators_not_available: not_available,
  drr17_indicators_future: future,
}) => ({
  met,
  not_met,
  not_available,
  future,
});


const indicator_text = (is_actual, indicator) => {
  const {
    doc,
    
    target_type,
    data_type,
    min, 
    max,
    narrative,
    measure,
    actual_result,
  
    is_new,
  } = indicator;
  const target_unspecified_display = text_maker("unspecified_target");
  
  const type = is_actual ? data_type : target_type;
  const measure_display = (measure) => !_.isEmpty(measure) && `( ${measure} )`;

  const type_by_data_type = {
    num: "result_num",
    num_range: "result_num",
    dollar: "dollar",
    dollar_range: "dollar",
    percent: "result_percentage",
    percent_range: "result_percentage",
  };

  const upper_target_display = (type, measure, data) =>
    is_actual ?
      formats[type_by_data_type[type]](+data) + (measure_display(measure) || "") :
      `${text_maker("result_upper_target_text")} ${formats[type_by_data_type[type]](+data)}` + (measure_display(measure) || "");
  const lower_target_display = (type, measure, data) => 
    is_actual ?
      formats[type_by_data_type[type]](+data) + (measure_display(measure) || "") :
      `${text_maker("result_lower_target_text")} ${formats[type_by_data_type[type]](+data)}` + (measure_display(measure) || "");
  const exact_display = (type, measure, data) => 
    is_actual ?
      formats[type_by_data_type[type]](+data) + (measure_display(measure) || "") :
      `${text_maker("result_exact_text")} ${formats[type_by_data_type[type]](+data)}` + (measure_display(measure) || "");
  const range_display = (type, measure, data_min, data_max) => 
    is_actual ?
      formats[type_by_data_type[type]](+data_min) + (measure_display(measure) || "") :
      `${text_maker("result_range_text")} ${formats[type_by_data_type[type]](+data_min)} ${text_maker("and")} ${formats[type_by_data_type[type]](+data_max)}` + (measure_display(measure) || "");

  const get_display_case = (type, min, max, narrative, measure, actual_result) => {
    switch(type){
      case 'num':
      case 'num_range':
      case 'dollar':
      case 'dollar_range':
      case 'percent':
      case 'percent_range': {
        if ( /range/.test(type) && (min && max) ){
          return is_actual ? range_display(type, measure, actual_result, actual_result) : range_display(type, measure, min, max);
        } else if (min && max && min === max){
          return is_actual ? exact_display(type, measure, actual_result) : exact_display(type, measure, min);
        } else if (min && !max){
          return is_actual ? lower_target_display(type, measure, actual_result) : lower_target_display(type, measure, min);
        } else if (!min && max){
          return is_actual ? upper_target_display(type, measure, actual_result) : upper_target_display(type, measure, max);
        } else {
          return target_unspecified_display; 
        }
      }
  
      case 'text': {
        if ( _.isEmpty(narrative) ){ return target_unspecified_display; }
        return narrative;
      }
  
      case 'tbd': {
        return text_maker("tbd_result_text");
      }
  
      default: {
        //certain indicators have no targets
        return null;
      }
    }
  };

  return get_display_case(type, min, max, narrative, measure);
};


const drr17_indicator_text = (is_actual, indicator) => { // is_actual has no effect on the display of drr17 indicators, keeping it here for similarity with the main function
  const {
    data_type,
    min, 
    max,
    narrative,
    measure,
  } = indicator;
  const target_unspecified_display = text_maker("unspecified_target");
  
  const measure_display = (measure) => !_.isEmpty(measure) && `( ${measure} )`;
  switch(data_type){
    case 'exact_num':
    case 'num': {
      const num = min || max;
      if( !num ){ return target_unspecified_display; }
      return formats["result_num"](+num) + (measure_display(measure) || "");
    }
    case 'dollar': {
      const num = min || max;
      if( !num ){ return target_unspecified_display; }
      return formats["dollar_raw"](+num) + (measure_display(measure) || "");
    }
    case 'percent': {
      const num = min || max;
      if( !num ){ return target_unspecified_display; }
      return formats["result_percentage"](+num) + (measure_display(measure) || "");
    }
    case 'num_range': {
      if( !min && !max){ return target_unspecified_display; }
      return formats["result_num"](+min) + ` ${text_maker("to")} ` + formats["result_num"](+max) + (measure_display(measure) || "");
    }
    case 'percent_range': {
      if( !min && !max){ return target_unspecified_display; }
      return formats["result_percentage"](+min) + ` ${text_maker("to")} ` + formats["result_percentage"](+max) + (measure_display(measure) || "");
    }
    case 'dollar_range': {
      if( !min && !max){ return target_unspecified_display; }
      return formats["dollar_raw"](+min) + ` ${text_maker("to")} ` + formats["dollar_raw"](+max) + (measure_display(measure) || "");
    }
    case 'text': {
      if( _.isEmpty(narrative) ){ 
        return target_unspecified_display; 
      }
      return narrative;
    }
    default: {
      return null;
    }
  }
};


export {
  Result,
  Indicator,
  SubProgramEntity,
  ResultCounts,
  GranularResultCounts,
  status_key_to_glossary_key,
  ordered_status_keys,
  result_docs,
  get_result_doc_keys,

  compute_counts_from_set,

  planned_resource_fragment,
  link_to_results_infograph,
  isDeptWithoutResults,
  row_to_drr_status_counts,
  result_statuses,
  result_simple_statuses,
  indicator_text,
  drr17_indicator_text,
};
