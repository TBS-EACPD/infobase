import './TextDiff.scss';
import diff_text from './TextDiff.yaml';

import { Fragment } from 'react';
import MediaQuery from 'react-responsive';
import classNames from 'classnames';
import * as Diff from 'diff';

import { StandardRouteContainer } from '../core/NavComponents.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import { formats } from '../core/format.js';

import { Subject } from '../models/subject';
import { result_docs } from '../models/results.js';

import { Result, indicator_text } from '../panels/result_graphs/results_common.js';
import result_text from '../panels/result_graphs/result_components.yaml';

import * as declarative_charts from '../charts/declarative_charts.js';

import {
  Select,
  PresentationalPanel,
  create_text_maker_component,
  SpinnerWrapper,
} from '../components';

const {
  GraphLegend,
} = declarative_charts;

const { Dept, CRSO, Program } = Subject;

const { TM, text_maker } = create_text_maker_component([diff_text, result_text]);

const get_subject_from_props = (props) => {
  const {
    match: {
      params: { org_id, crso_id, program_id },
    },
  } = props;
  if(program_id && Program.lookup(program_id)){
    return Program.lookup(program_id);
  }
  if(crso_id && CRSO.lookup(crso_id)){
    return CRSO.lookup(crso_id);
  }
  if (org_id && Dept.lookup(org_id)) {
    return Dept.lookup(org_id);
  }
  return props.subject; // default
};

const subject_intro = (subject, num_indicators, years) =>
  <div className="medium_panel_text">
    <TM 
      k={"indicator_counts_text"}
      args={{
        subject: subject,
        name: subject.name,
        doc_year_1: result_docs[years[0]].year,
        doc_year_2: result_docs[years[1]].year,
        num_indicators: num_indicators,
      }}
    />
  </div>;

const get_indicators = (subject) => {
  return _.chain(Result.get_all())
    .filter(res => {
      const res_subject = Program.lookup(res.subject_id) || CRSO.lookup(res.subject_id);
      return subject.level === 'dept' ? res_subject.dept === subject : res_subject === subject || res_subject.crso === subject;
    })
    .map(res => res.indicators)
    .flatten()
    .groupBy("stable_id")
    .map(pair => _.sortBy(pair, "doc"))
    .value();
};
const process_indicators = (matched_indicators, indicator_status) => {
  const processed_indicators = _.chain(matched_indicators)
    .map(indicator_pair => {
      if (indicator_pair.length === 2){
        const name_diff = Diff.diffWords(indicator_pair[0].name, indicator_pair[1].name);
        const methodology_diff = window.is_a11y_mode ? Diff.diffSentences(indicator_pair[0].methodology, indicator_pair[1].methodology) : Diff.diffWords(indicator_pair[0].methodology, indicator_pair[1].methodology);
        const target_diff = Diff.diffWords(indicator_text(indicator_pair[0], false), indicator_text(indicator_pair[1], false));
        const target_explanation_diff = Diff.diffWords(indicator_pair[0].target_explanation || "", indicator_pair[1].target_explanation || "");
        const status = _.max([name_diff.length, methodology_diff.length, target_diff.length]) > 1 ?
                        target_diff.length > 1 ?
                          "target_changed"
                          : "indicator_desc_changed"
                        : "no_diff";
        return {
          status,
          indicator1: indicator_pair[0],
          indicator2: indicator_pair[1],
          name_diff,
          methodology_diff,
          target_diff,
          target_explanation_diff,
        };
      }
      const indicator = indicator_pair[0];
      const status = indicator.doc === "dp18" ?
        "indicator_removed":
          indicator.doc === "dp19" ? "indicator_added": indicator.doc;
      return {
        status: status,
        indicator1: indicator,
        indicator2: indicator,
        name_diff: [indicator.name],
        methodology_diff: [indicator.methodology],
        target_diff: [indicator_text(indicator, false)],
        target_explanation_diff: [indicator.target_explanation],
      };
    })
    // target_changed is subset of indicator_desc_changed so it must be included
    .filter(row => indicator_status["indicator_desc_changed"].active && row.status === "target_changed" ?
            true : indicator_status[row.status].active)
    .value();
  return processed_indicators;
};

const no_difference = (text, key) =>
  <Fragment>
    <div className="text-diff__indicator-report__subheader" >
      <h4>{`${text_maker(key)} (${text_maker("no_diff")})`}</h4>
    </div>
    <div className="text-diff__indicator-report__row">
      <div>{text}</div>
    </div>
  </Fragment>;

const difference_report = (diff, key, years) => {
  const year1 = (
    <div className="col-md-6" >
      <h5>{result_docs[years[0]].year}</h5>
    </div>
  );
  const year2 = (
    <div className="col-md-6" >
      <h5>{result_docs[years[1]].year}</h5>
    </div>
  );

  const removed_part = (
    <div className="col-md-6" >
      {_.map(diff, (part,iix) =>
        <Fragment key={iix}>
          {window.is_a11y_mode && part.removed && <span className='text-diff__text-part--removed'> [{text_maker("a11y_begin_removed")}]</span>}
          <span
            className={part.removed ? 'text-diff__text-part--removed' : ''}
            style={{display: part.added ? "none" : "inline"}}
          >
            {part.value}
          </span>
          {window.is_a11y_mode && part.removed && <span className='text-diff__text-part--removed'> [{text_maker("a11y_end_removed")}]</span>}
        </Fragment>
      )}
    </div>
  );
  const added_part = (
    <div className="col-md-6" >
      {_.map(diff, (part,iix) =>
        <Fragment key={iix}>
          {window.is_a11y_mode && part.added && <span className='text-diff__text-part--added'> [{text_maker("a11y_begin_added")}]</span>}
          <span
            className={ part.added ? 'text-diff__text-part--added' : ''}
            style={{display: part.removed ? "none" : "inline"}}
          >
            {part.value}
          </span>
          {window.is_a11y_mode && part.added && <span className='text-diff__text-part--added'> [{text_maker("a11y_end_added")}]</span>}
        </Fragment>
      )}
    </div>
  );

  return (
    <Fragment>
      <div className="text-diff__indicator-report__subheader" >
        <h4> { text_maker(key) } </h4>
      </div>
      <MediaQuery minWidth={992}>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          { year1 }
          { year2 }
        </div>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          { removed_part }
          { added_part }
        </div>
      </MediaQuery>
      <MediaQuery maxWidth={991}>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          { year1 }
        </div>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          { removed_part }
        </div>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          { year2 }
        </div>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          { added_part }
        </div>
      </MediaQuery>
    </Fragment>
  );
};


const get_status_flag = (indicator_status, years) => {
  if(indicator_status === "target_changed"){
    return (
      <Fragment>
        <div className="text-diff__indicator-status--change">
          {text_maker("words_changed")}
        </div>
        <div className="text-diff__indicator-status--change">
          {text_maker("target_changed")}
        </div>
      </Fragment>
    );
  }
  if(indicator_status === "indicator_desc_changed"){
    return (
      <div className="text-diff__indicator-status--change">
        {text_maker("words_changed")}
      </div>
    );
  }
  if (indicator_status === "no_diff"){
    return (
      <div className="text-diff__indicator-status--nochange">
        {text_maker("no_diff")}
      </div>
    );
  }
  if(indicator_status === "indicator_removed"){
    return (
      <div className="text-diff__indicator-status--removed">
        {text_maker("indicator-removed", {second_year: result_docs[years[1]].year})}
      </div>
    );
  }
  if(indicator_status === "indicator_added"){
    return (
      <div className="text-diff__indicator-status--added">
        {text_maker("indicator-added", {second_year: result_docs[years[1]].year})}
      </div>
    );
  }
  return "";
};


const indicator_report = (processed_indicator, years) => (
  <div className="text-diff__indicator-report" key={processed_indicator.indicator1.stable_id}>
    <PresentationalPanel title={processed_indicator.indicator2.name}>
      <Fragment>
        { get_status_flag(processed_indicator.status, years) }
        { processed_indicator.name_diff.length > 1 ?
          difference_report(processed_indicator.name_diff, "indicator_name", years) :
          no_difference(processed_indicator.indicator1.name, "indicator_name") }
        { processed_indicator.methodology_diff.length > 1 ?
          difference_report(processed_indicator.methodology_diff, "indicator_methodology", years) :
          no_difference(processed_indicator.indicator1.methodology, "indicator_methodology") }
        { processed_indicator.target_diff.length > 1 ?
          difference_report(processed_indicator.target_diff, "indicator_target", years) :
          no_difference(indicator_text(processed_indicator.indicator1, false), "indicator_target") }
        { processed_indicator.target_explanation_diff.length > 1 ?
            difference_report(processed_indicator.target_explanation_diff, "indicator_target_explanation", years) :
            no_difference(processed_indicator.indicator1.target_explanation, "indicator_target_explanation") }
        <div className="text-diff__id-tag">{`ID: ${processed_indicator.indicator1.stable_id}`}</div>
      </Fragment>
    </PresentationalPanel>
  </div>
);


export default class TextDiffApp extends React.Component {
  constructor(props) {
    super(props);
    const colors = d3.scaleOrdinal().range([
      window.infobase_color_constants.primaryColor,
      window.infobase_color_constants.warnDarkColor,
      window.infobase_color_constants.successDarkColor,
      window.infobase_color_constants.failDarkColor,
      window.infobase_color_constants.infoDarkColor,
    ]);

    this.state = {
      first_load: true,
      loading: true,
      subject: get_subject_from_props(props),
      indicator_status_changed: false,
      indicator_status: _.reduce([
        { label: text_maker("indicator_desc_changed"), id: "indicator_desc_changed" }, 
        { label: text_maker("target_changed"), id: "target_changed" },
        { label: text_maker("indicator_added"), id: "indicator_added" }, 
        { label: text_maker("indicator_removed"), id: "indicator_removed" },
        { label: text_maker("no_diff"), id: "no_diff" },
      ],
      (result, status) => {
        result[status.id] = {
          active: true,
          label: status.label,
          id: status.id,
          color: colors(status.id),
        };
        return result;
      }, {} ),
    };
  }

  get_new_url(context){
    if(context.level === 'dept'){
      return `/diff/${context.id}`;
    } else if(context.level === 'crso'){
      return `/diff/${context.dept.id}/${context.id}`;
    } else if(context === 'all'){
      const { subject } = this.state;
      return `/diff/${subject.level === 'dept' ? subject.id : subject.dept.id}`;
    } else {
      return `/diff/${context.dept.id}/${context.crso.id}/${context.id}`;
    }
  };
  
  componentDidMount(){
    const {
      subject,
      indicator_status,
    } = this.state;
    ensure_loaded({
      subject,
      results: true,
      result_docs: _.chain(result_docs).keys().filter( doc => /^dp[0-9]+/ ).takeRight(2).value(),
    })
      .then( () => {
        const matched_indicators = get_indicators(subject);
        const processed_indicators = process_indicators(matched_indicators, indicator_status);
        
        this.setState({
          first_load: false,
          subject: subject,
          loading: false,
          matched_indicators: matched_indicators,
          processed_indicators: processed_indicators,
        });
      });
  }


  static getDerivedStateFromProps(props, state){
    const {
      first_load,
      subject,
      indicator_status_changed,
    } = state;
    const should_load = first_load || get_subject_from_props(props) !== subject || indicator_status_changed;
    const new_subject = should_load ? get_subject_from_props(props) : subject;
    return {
      loading: should_load,
      subject: new_subject,
      indicator_status_changed: false,
    };
  }

  componentDidUpdate(){
    const {
      loading,
      subject,
      indicator_status,
    } = this.state;

    if(loading){
      ensure_loaded({
        subject,
        results: true,
        result_docs: _.chain(result_docs).keys().filter( doc => /^dp[0-9]+/ ).takeRight(2).value(),
      })
        .then( () => {
          const matched_indicators = get_indicators(subject);
          const processed_indicators = process_indicators(matched_indicators, indicator_status);
          
          this.setState({
            first_load: false,
            subject: subject,
            loading: false,
            matched_indicators: matched_indicators,
            processed_indicators: processed_indicators,
          });
        });
    }
  }

  render() {
    const { 
      loading,
      subject,
      processed_indicators,
      indicator_status,
    } = this.state;

    const {
      history,
    } = this.props;

    const all_depts = _.chain(Dept.get_all()).filter(dept => !!dept.dp_status).sortBy('fancy_name').value();
    const crs_without_internal = _.filter(subject.level === 'dept' ? subject.crsos : subject.dept.crsos, cr => cr.is_cr && !(cr.is_internal_service));

    const current_dept = subject.level === 'dept' ? subject : subject.dept;

    // TODO: allow this to change
    const years = _.chain(result_docs)
      .keys()
      .filter( doc => /^dp[0-9]+/ )
      .takeRight(2)
      .value();
    
    return (
      <StandardRouteContainer
        title={text_maker("diff_title")}
        breadcrumbs={[text_maker("diff_title")]}
        description={text_maker("diff_intro_text")}
        route_key="_diff"
        beta={true}
      >
        <TM k="diff_title" el="h1" />
        <div className={classNames("medium_panel_text","text-diff__instructions")}>
          <TM k="diff_intro_text"/>
        </div>
        <div className={classNames("medium_panel_text")}>
          <label htmlFor='select_dept'>
            <TM k="select_dept" />
          </label>
          <Select
            className='text-diff__selector'
            id='select_dept'
            selected={current_dept.id}
            onSelect={id => {
              const new_url = this.get_new_url(Dept.lookup(id));
              history.push(new_url);
            }}
            options={ _.map(all_depts, dept => ({id: dept.id, display: dept.fancy_name}) )}
          />
        </div>
        <div className={classNames("medium_panel_text")}>
          <label htmlFor='select_cr'>
            <TM k="select_cr" />
          </label>
          <Select
            className='text-diff__selector'
            id='select_cr'
            selected={subject.level === 'program' ?
              subject.crso.id :
              subject.level === 'crso' ? subject.id : 'all'}
            onSelect={id => {
              const new_url = this.get_new_url(CRSO.lookup(id) || id);
              history.push(new_url);
            }}
            options={_.chain(crs_without_internal).map(cr => ({id: cr.id, display: cr.name})).concat([{id: 'all', display: text_maker('all_crs')}]).value() }
          />
        </div>
        <div className={classNames("medium_panel_text")}>
          <label htmlFor='select_program'>
            <TM k="select_program" />
          </label>
          <Select
            className='text-diff__selector'
            id='select_program'
            selected={subject.level === 'program' ? subject.id : 'all'}
            onSelect={id => {
              const new_url = this.get_new_url(Program.lookup(id) || id);
              history.push(new_url);
            }}
            options={_.chain(
              subject.level === 'dept' ?
                crs_without_internal :
                subject.level === 'crso' ? [subject] : [subject.crso])
              .map('programs')
              .flatten()
              .compact()
              .map(prog => ({id: prog.id, display: prog.name}))
              .concat([{id: 'all', display: text_maker('all_programs')}])
              .value()
            }
          />
        </div>
        <div className={classNames("medium_panel_text")}>
          <label htmlFor='filter_by_status'>
            <TM k="filter_by_status" />
          </label>
          <div style={{padding: '0px 0px 20px 0px'}}>
            <div className="legend-container">
              <GraphLegend
                items={indicator_status}
                onClick={ id => {
                  indicator_status[id].active = !indicator_status[id].active;
                  this.setState({
                    indicator_status: indicator_status,
                    indicator_status_changed: true,
                  });
                }}
              />
            </div>
          </div>
        </div>
        {loading ? <SpinnerWrapper ref="spinner" config_name={"sub_route"} /> :
          <div>
            <h2>{text_maker("list_of_indicators")}</h2>
            <div>{subject_intro(subject, processed_indicators.length, years)}</div>
            {_.map(processed_indicators, processed_indicator => indicator_report(processed_indicator, years) )}
          </div>}
      </StandardRouteContainer>
    );
  }
}

TextDiffApp.defaultProps = {
  subject: Dept.lookup(326),
};



