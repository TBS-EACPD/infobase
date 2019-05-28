import './diff.scss';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { create_text_maker } from '../models/text.js';
import { 
  create_text_maker_component,
} from '../util_components.js';
import lab_text from './diff.yaml';
import { get_static_url } from '../request_utils.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import { single_subj_results_scheme, get_initial_single_subj_results_state } from '../gen_expl/results_scheme.js';
import { 
  Result,
  Indicator,
  ResultCounts,
  GranularResultCounts,
  result_docs,
} from '../panels/result_graphs/results_common.js'
import { Subject } from '../models/subject.js';
import { Select } from '../components/Select.js';
import { SpinnerWrapper } from '../components/SpinnerWrapper.js';
import * as Diff from 'diff';
import { Fragment } from 'react';

const { Dept, CRSO, Program } = Subject;


const { TM } = create_text_maker_component(lab_text);
const text_maker = create_text_maker(lab_text);


const get_subject_from_props = (props) => {
  const {
    match: {
      params: { org_id, crso_id },
    },
  } = props;
  if(crso_id && CRSO.lookup(crso_id)){
    return CRSO.lookup(crso_id)
  }
  if (org_id && Dept.lookup(org_id)) {
    return Dept.lookup(org_id)
  }
  return props.subject; // default
}

export default class TextDiffApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      subject: get_subject_from_props(props)
    };
  }

  componentDidMount(){
    const { 
      subject,
    } = this.state;
  
    ensure_loaded({
      subject,
      results: true,
      result_docs: ['dp19','dp18'],
    })
      .then( () => this.setState({subject: subject, loading: false}) );
  }

  static getDerivedStateFromProps(props, state){
    const {
      match: {
        params: {
          org_id,
          crso_id,
        },
      },
    } = props;

    const {
      subject,
    } = state;

    const should_load = get_subject_from_props(props) !== subject;
    const new_subject = should_load ? get_subject_from_props(props) : subject;
    return {loading: should_load, subject: new_subject};
  }

  componentDidUpdate(){
    const {
      loading,
      subject,
    } = this.state;


    if(loading){
      ensure_loaded({
        subject,
        results: true,
        result_docs: ['dp19','dp18'],
      })
        .then( () => this.setState({loading: false}) );
    }
  }

  render() {
    const { 
      loading,
      subject,
    } = this.state;

    const { 
      history,
      org_id,
      crso_id,
    } = this.props;

    const all_depts = _.chain(Dept.get_all()).filter().sortBy('fancy_name').value();
    const all_crsos_for_subj = 

    if(!loading){
      const matched_indicators = _.chain(Result.get_all())
        .filter(res => {
          const res_subject = Program.lookup(res.subject_id) || CRSO.lookup(res.subject_id);
          return subject.level === 'dept' ? res_subject.dept === subject : res_subject === subject;
        })
        .map(res => res.indicators)
        .flatten()
        .groupBy("stable_id")
        .filter(pair => pair.length===2)
        .map(pair => _.sortBy(pair, "doc"))
        .value();
      
      this.name_differences = _.map(matched_indicators, indicator_pair => Diff.diffWords(indicator_pair[0].name, indicator_pair[1].name) );
      this.methodology_differences = _.map(matched_indicators, indicator_pair => Diff.diffWords(indicator_pair[0].methodology, indicator_pair[1].methodology) );
    }
    return (
      loading ? <SpinnerWrapper ref="spinner" config_name={"sub_route"} /> :
        <StandardRouteContainer
          title={text_maker("diff_title")}
          breadcrumbs={[text_maker("diff_title")]}
          //description={} TODO
          route_key="_diff"
        >
          <TM k="diff_title" el="h1" />
          <div>
            <TM k="diff_intro_text"/>
          </div>
          <div>
            <label htmlFor='select_dept'>
              <TM k="select_dept" />
            </label>
            <Select
              name='select_dept'
              selected={org_id}
              onSelect={id => {
                const new_url = `/diff/${id}`;
                history.push(new_url);
              }}
              options={ _.map(all_depts, dept => ({id: dept.id, display: dept.fancy_name}) )}
            />
          </div>
          <div>
            <label htmlFor='select_cr'>
              <TM k="select_cr" />
            </label>
            <Select
              name='select_cr'
              selected={crso_id}
              onSelect={id => {
                const new_url = `/diff/${subject.id}/${id}`;
                history.push(new_url);
              }}
              options={_.chain(subject.crsos).map(crso => ({id: crso.id, display: crso.name})).concat([{id: 'all', display: text_maker('all_crsos')}]).value() }
            />
          </div>
          <div>
            <TM k="name_diffs" el="h2" />
            <div className="row">
              {difference_report(this.name_differences)}
            </div>
          </div>
          <div>
            <TM k="methodology_diffs" el="h2" />
            <div className="row">
              {difference_report(this.methodology_differences)}
            </div>
          </div>
        </StandardRouteContainer>
    );
  }

}

TextDiffApp.defaultProps = {
  subject: Dept.lookup(326),
}

const difference_report = (diffs) => {
  return _.chain(diffs).filter(indicator=>indicator.length>1).map((indicator,ix) =>
    <div key={ix} className="row" style={{marginBottom: "10px", borderBottom: "1px solid black"}}>
      <div className="col-md-6" >
        {_.map(indicator, (part,iix) =>
          <span
            key={iix}
            className={part.removed ? 'removed' : ''}
            style={{display: part.added ? "none" : "inline"}}
          >
            {part.value}
          </span>
        )}
      </div>
      <div className="col-md-6" >
        {_.map(indicator, (part,iix) =>
          <span
            key={iix}
            className={ part.added ? 'added' : ''}
            style={{display: part.removed ? "none" : "inline"}}
          >
            {part.value}
          </span>
        )}
      </div>
    </div>
  )
    .value();
}