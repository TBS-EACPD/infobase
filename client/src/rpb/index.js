import { StandardRouteContainer, LangSynchronizer } from '../core/NavComponents';
import { createSelector } from 'reselect';
import { withRouter } from 'react-router';
import { log_standard_event } from '../core/analytics.js';
import { Fragment } from 'react';
import { TextMaker, text_maker } from './rpb_text_provider.js';
import './rpb.scss';

//data and state stuff
import { 
  reducer, 
  mapDispatchToProps, 
  create_mapStateToProps, 
  naive_to_real_state, 
} from './state_and_data.js';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { ensure_loaded } from '../core/lazy_loader.js';
import { Subject } from '../models/subject.js';

const { Gov } = Subject;

//re-usable view stuff
import { 
  SpinnerWrapper,
  RadioButtons, 
  LabeledBox,
} from '../components/index.js';
import AriaModal from 'react-aria-modal';

//specific view stuff
import { TablePicker } from './TablePicker.js';
import { SimpleView } from './simple_view.js';
import { GranularView } from './granular_view.js';
import { SubjectFilterPicker } from './shared.js';
import { Table } from '../core/TableClass.js';

//misc app stuff
import { rpb_link } from './rpb_link.js';
import { SafeJSURL } from '../general_utils.js';

const sub_app_name = "_rpb";


const url_state_selector = createSelector(_.identity, str => {
  let state = {};
  if(_.nonEmpty(str)){
    state = _.chain(str)
      .pipe(str => SafeJSURL.parse(str) )
      .pipe(naive=> naive_to_real_state(naive) )
      .value();
  } else {
    state = naive_to_real_state({});
  }
  return state;
});

const RPBTitle = ({ table_name, subject_name }) => {
  const title_prefix = text_maker("report_builder_title"); 
  if(!table_name){
    return <h1> {title_prefix} </h1>;
  } if(!subject_name){
    return <h1> {title_prefix} - {table_name} </h1>;
  }
  return <h1> {title_prefix} - {table_name} - {subject_name} </h1>;
};

function slowScrollDown(){
  const el = document.getElementById('rpb-main-content');
  if(!_.isElement(el)){ 
    return;
  }
  el.focus();
  d3.select(el)
    .transition()
    .duration(1000)
    .tween("uniquetweenname2", ()=>{
      const i = d3.interpolateNumber(0, el.getBoundingClientRect().top);
      return t => { window.scrollTo( 0, i(t) ); };
    });
}

class Root extends React.Component {
  constructor(props){
    super(props);

    const { state } = this.props;
    
    const mapStateToProps = create_mapStateToProps();
    /* eslint-disable-next-line no-use-before-define */
    const Container = connect(mapStateToProps, mapDispatchToProps)(RPB);

    const store = createStore(reducer, state);

    this.state = {
      store,
      Container,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState){
    prevState.store.dispatch({
      type: "navigate_to_new_state",
      payload: nextProps.state,
    });
    return null;
  }
  shouldComponentUpdate(newProps){
    return rpb_link(this.state.store.getState()) !== rpb_link(newProps.state);
  }
  render(){

    const { 
      Container,
      store,
    } = this.state;

    return (
      <Provider store={store}>
        <Container />
      </Provider>
    );

  }
}

class RPB extends React.Component {
  constructor(props){
    super(props);
    if(props.table){
      this.state = {
        table_picking: false,
      };

      setTimeout(()=> {
        slowScrollDown();
      });

    } else {
      this.state = {
        loading: false,
        table_picking: true,
      };
    }

  }
  pickTable(table_id){
    if(this.state.loading){ return; }
    this.setState({
      loading: true,
      table_picking: false,
    });
    ensure_loaded({ 
      table_keys: [table_id], 
      footnotes_for: 'all',
    }).then( ()=> {
      this.props.on_switch_table(table_id);
      this.setState({ loading: false });
      setTimeout(()=> {
        slowScrollDown();
      });
    });
  }
  
  render(){

    const {
      table,
      mode, 
      subject,

      on_switch_mode,
      on_set_subject,
    } = this.props;


    return <div style={{minHeight: '800px', marginBottom: '100px'}} id="">
      <URLSynchronizer state={this.props} />
      <LangSynchronizer 
        lang_modifier={hash=>{
          const config_str = hash.split("rpb/")[1];
          if(_.isEmpty(config_str)){ 
            return hash;
          } else {
            let state = _.cloneDeep(url_state_selector(config_str));
            delete state.filter;
            return rpb_link((state));
          }
        }} 
      />
      <RPBTitle 
        subject_name={subject !== Gov && subject && subject.name}
        table_name={table && table.name}
      />
      <LabeledBox
        label={ <TextMaker text_key="blue_text_pick_data" /> }
        content={
          <div>
            <div className="centerer">
              <p 
                id="picker-label"
                className="md-half-width md-gutter-right"
                style={{margin: 0}}
              >
                { table ? 
                  <TextMaker text_key="table_picker_select_different_summary" args={{name: table.name}} /> :
                  <TextMaker text_key="table_picker_none_selected_summary" /> 
                } 
              </p>
              <div className="md-half-width md-gutter-left">
                { 
                  window.is_a11y_mode ?
                    <AccessibleTablePicker
                      onSelect={id => this.pickTable(id)}
                      tables={_.reject(Table.get_all(), 'reference_table')}
                      selected={_.get(table, 'id')}
                    /> :
                    <button 
                      className="btn btn-ib-primary"
                      style={{width: '100%'}}
                      onClick={()=>{ this.setState({table_picking: true});}}
                    >
                      <TextMaker text_key={table ? 'select_another_table_button' : 'select_table_button'} /> 
                    </button>
                }
              </div>
            </div>
            {!window.is_a11y_mode &&
              <AriaModal
                mounted={this.state.table_picking}
                onExit={()=>{ 
                  if( this.state.table_picking ){
                    this.setState({ table_picking: false }); 
                    setTimeout(()=>{
                      slowScrollDown();
                      const sub_app_node = document.querySelector('#'+sub_app_name);
                      if(sub_app_node !== null){
                        sub_app_node.focus();
                      }
                    },200);
                  }
                }}
                titleId="tbp-title"
                getApplicationNode={()=>document.getElementById('app')}
                verticallyCenter={true}
                underlayStyle={{
                  paddingTop: "50px",
                  paddingBottom: "50px",
                }}
                focusDialog={true}
              >
                <div 
                  tabIndex={-1}
                  id="modal-child"
                  className="container app-font"
                  style={{
                    backgroundColor: 'white',
                    overflow: 'auto',
                    lineHeight: 1.5,
                    padding: "0px 20px 0px 20px",
                    borderRadius: "5px",
                    fontWeight: 400,
                  }}
                >
                  <TablePicker onSelect={id=> this.pickTable(id)} />
                </div>
              </AriaModal>
            }
          </div>
        }
      />
      {
        this.state.loading ? 
          <SpinnerWrapper config_name={"route"} /> :
          <Fragment>
            <LabeledBox
              label={ <TextMaker text_key="blue_text_pick_org" /> }
              content={
                <SubjectFilterPicker 
                  subject={subject}  
                  onSelect={ subj=> on_set_subject(subj) }
                />
              }
            />
            <LabeledBox
              label={ <TextMaker text_key="blue_text_select_mode" /> }
              content={
                <div className="centerer">
                  <RadioButtons
                    options = {[
                      {id: 'simple', display: <TextMaker text_key="simple_view_title" />, active: mode==='simple'},
                      {id: 'details', display: <TextMaker text_key="granular_view_title" />, active: mode==='details'}]}
                    
                    onChange={ id =>{
                      on_switch_mode(id);} 
                    }
                  />
                </div>
              }
            />
            {
              table ? 
              (
                mode === 'simple' ?
                <SimpleView {...this.props} /> :
                <GranularView {...this.props} /> 
              ) :
              null
            }
          </Fragment>
      }
    </div>;

  }
}



class AnalyticsSynchronizer extends React.Component {
  //note that we do not update the URL when componentDidMount(). 
  //this is so that the URL isn't printed too often
  //alternatively, we *can* overwrite the URL in componentDidMount() using replaceState().
  render(){ return null; }
  shouldComponentUpdate(new_props){
    const table_has_changed = new_props.table !== this.props.table;
    const subject_has_changed = new_props.subject !== this.props.subject;
    const mode_has_changed = new_props.mode !== this.props.mode;

    return mode_has_changed || table_has_changed || subject_has_changed;
  }
  componentDidUpdate(){
    if(this.props.table){
      this.send_event(); 
    }
  }
  componentDidMount(){
    if(this.props.table){
      this.send_event();
    }
  }
  send_event(){
    log_standard_event({
      SUBAPP: sub_app_name,
      SUBJECT_GUID: this.props.subject,
      MISC1: this.props.table,
      MISC2: this.props.mode,
    });


  }

}


const URLSynchronizer = withRouter(
  class URLSynchronizer_ extends React.Component {
    render(){ return null; }
    shouldComponentUpdate(new_props){
      // return rpb_link(this.props.state) !== rpb_link(new_props.state);
      return rpb_link(new_props.state) !== window.location.hash;
    }
    componentDidMount(){ //on the first render, it's possible the url is naive
      const { history } = this.props;
      const new_url = rpb_link(this.props.state, true);
      history.replace(new_url);
    }
    componentDidUpdate(){
      const { history } = this.props;
      const new_url = rpb_link(this.props.state, true);
      history.push(new_url);
    }

  }
);


export default class ReportBuilder extends React.Component { 
  constructor(){
    super();
    this.state = {
      loading: true,
      config_str: null,
      url_state: null,
    };
  }
  loadDeps({table}){
    ensure_loaded({
      table_keys: [table],
      footnotes_for: 'all',
    }).then(()=> {
      this.setState({
        loading: false,
      });
    });
  }
  static getDerivedStateFromProps(nextProps, prevState){
    const config_str = nextProps.match.params.config;
    const url_state = url_state_selector(config_str);

    let loading = _.isNull(prevState.config_str) ||
      _.isNull(prevState.url_state) ||
      (url_state.table && prevState.url_state.table !== url_state.table);


    if(_.isEmpty(url_state.table)){
      loading = false;
    }

    return {
      loading,
      config_str,
      url_state,
    };
  }
  componentDidMount(){
    const { url_state } = this.state;
    if(url_state.table){
      this.loadDeps(url_state);
    }
  }
  shouldComponentUpdate(nextProps, nextState){
    return (this.state.loading !== nextState.loading) || (this.state.config_str !== nextState.config_str);
  }
  componentDidUpdate(){
    if (this.state.loading){
      this.loadDeps(this.state.url_state);
    }
  }
  render(){
    const { url_state } = this.state;

    return (
      <StandardRouteContainer 
        title={text_maker("report_builder_title")}
        breadcrumbs={[text_maker("self_serve")]}
        description={text_maker("report_builder_meta_desc")}
        route_name="_rpb"
        shouldSyncLang={false}
      >
        <AnalyticsSynchronizer {...url_state} />
        { 
          this.state.loading ? 
            <SpinnerWrapper config_name={"route"} /> :
            <Root state={url_state} />
        }
      </StandardRouteContainer>
    );
  }
}



const AccessibleTablePicker = ({ tables, onSelect, selected }) => (
  <select 
    aria-labelledby="picker-label"
    className="form-control form-control-ib rpb-simple-select"
    value={selected}
    onChange={evt => onSelect(evt.target.value)}
  >
    {_.map(tables, ({id, name}) =>
      <option key={id} value={id}>
        {name}
      </option>
    )}
  </select>
);