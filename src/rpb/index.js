import { StandardRouteContainer, LangSynchronizer } from '../core/NavComponents';
import { createSelector } from 'reselect';
import withRouter from 'react-router/withRouter';
import { log_standard_event } from '../core/analytics.js';
const { text_maker } = require('../models/text');
require("./rpb.ib.yaml");
require('./rpb.scss');

//data and state stuff
const {
  reducer,
  mapDispatchToProps,
  create_mapStateToProps,
  naive_to_real_state,
} = require('./state_and_data.js');

const { createStore } = require('redux');
const { Provider, connect } = require('react-redux');

const { Gov } = require('../models/subject.js');
const { ensure_loaded } = require('../core/lazy_loader.js');


//re-usable view stuff
const {
  SpinnerWrapper,
  TextMaker,
  RadioButtons,
} = require('../util_components.js');
const AriaModal = require('react-aria-modal');


//specific view stuff
const { TablePicker } = require('./TablePicker.js');
const { SimpleView } = require('./simple_view.js');
const { GranularView } = require('./granular_view.js');
const { SubjectFilterPicker } = require('./shared.js');


//misc app stuff
const { rpb_link } = require('./rpb_link.js');
const JSURL = require('jsurl');
window.JSURL = JSURL;

const sub_app_name = "_rpb";



const RPBTitle = ({ table_name, subject_name }) => {
  const title_prefix = text_maker("report_builder_title"); 
  if(!table_name){
    return <h1> {title_prefix} </h1>;
  } if(!subject_name){
    return <h1> {title_prefix} - {table_name} </h1>;
  }
  return <h1> {title_prefix} - {table_name} - {subject_name} </h1>;
}



function slowScrollDown(){
  const el = document.getElementById('rpb-main-content')
  if(!_.isElement(el)){ 
    return;
  }
  el.focus();
  d4.select(el)
    .transition()
    .duration(1000)
    .tween("uniquetweenname2", ()=>{
      const i = d4.interpolateNumber(0, el.getBoundingClientRect().top);
      return t => { window.scrollTo( 0, i(t) ); };
    });
}

class Root extends React.Component {
  constructor(props){
    super(props);

    const { state } = this.props;
    
    const mapStateToProps = create_mapStateToProps();
    const Container = connect(mapStateToProps, mapDispatchToProps)(RPB)

    const store = createStore(reducer,state);

    Object.assign(this, { store, Container });

  }
  componentWillUpdate(nextProps){
    this.store.dispatch({
      type: "navigate_to_new_state",
      payload: nextProps.state,
    });

  }
  shouldComponentUpdate(newProps){
    return rpb_link(this.store.getState()) !== rpb_link(newProps.state)
  }
  render(){

    const { 
      Container,
      store,
    } = this;

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
      loading:true,
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
      })
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


    return <div style={{minHeight:'800px', marginBottom: '100px'}} id="">
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
      <div className='rpb-option'>
        <div className='rpb-option-label '>
          <div className='rpb-option-label-text '>
            <TextMaker text_key="blue_text_pick_data" />
          </div>
        </div>
        <div className='rpb-option-content'>
          <div className="centerer">
            <p 
              className="md-half-width md-gutter-right"
              style={{margin: 0}}
            >
              { table ? 
                <TextMaker text_key="table_picker_select_different_summary" args={{name: table.name}} /> :
                <TextMaker text_key="table_picker_none_selected_summary" /> 
              } 
            </p>
            <div className="md-half-width md-gutter-left">
              <button 
                className="btn btn-ib-primary"
                style={{width: '100%'}}
                onClick={()=>{ this.setState({table_picking: true})}}
              >
                <TextMaker text_key={table ? 'select_another_table_button' : 'select_table_button'} /> 
              </button>
            </div>
          </div>
          <AriaModal
            mounted={this.state.table_picking}
            onExit={()=>{ 
              if( this.state.table_picking ){
                this.setState({ table_picking: false }); 
                setTimeout(()=>{
                  slowScrollDown();
                  document.querySelector('#'+sub_app_name).focus();
                },200)
              }
            }}
            titleId="tbp-title"
            getApplicationNode={()=>document.getElementById('app')}
            verticallyCenter={true}
            underlayStyle={{
              paddingTop:"50px",
              paddingBottom:"50px",
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
                lineHeight : 1.5,
                padding: "0px 20px 0px 20px",
                borderRadius: "5px",
                fontWeight: 400,
              }}
            >
              <TablePicker onSelect={id=> this.pickTable(id)} />
            </div>
          </AriaModal>
        </div>
      </div>
      {
          this.state.loading ? 
          <SpinnerWrapper scale={4} /> :
          [
            <div key="pick-subject" className='rpb-option'>
              <div className='rpb-option-label '>
                <div className='rpb-option-label-text '>
                  <TextMaker text_key="blue_text_pick_org" />
                </div>
              </div>
              <div className='rpb-option-content'>
                <SubjectFilterPicker 
                  subject={subject}  
                  onSelect={ subj=> on_set_subject(subj) }
                /> 
              </div>
            </div>,
            <div key="pick-mode" className='rpb-option'>
              <div className='rpb-option-label '>
                <div className='rpb-option-label-text '>
                  <TextMaker text_key="blue_text_select_mode" />
                </div>
              </div>
              <div className='rpb-option-content'>
                <div className="centerer">
                  <RadioButtons
                    options = {[
                      {id: 'simple', display: <TextMaker text_key="simple_view_title" />, active: mode==='simple'},
                      {id: 'details', display: <TextMaker text_key="granular_view_title" />, active: mode==='details'}]}
                    
                    onChange={ id =>{
                      on_switch_mode(id)} 
                    }
                  />
                </div>
              </div>
            </div>,
            (
              table ? 
              (
                mode === 'simple' ?
                <SimpleView key="view" {...this.props} /> :
                <GranularView key="view" {...this.props} /> 
              ) :
              null
            ),
          ]
      }
    </div>

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
    })


  }

}


const URLSynchronizer = withRouter(
  class URLSynchronizer_ extends React.Component {
    //note that we do not update the URL when componentDidMount(). 
    //this is so that the URL isn't printed too often
    //alternatively, we *can* overwrite the URL in componentDidMount() using replaceState().
    render(){ return null; }
    shouldComponentUpdate(new_props){
      return rpb_link(this.props.state) !== rpb_link(new_props.state);
    }
    componentDidUpdate(){
      this.updateURLImperatively();
    }
    updateURLImperatively(){
      const { history } = this.props;
      const new_url = rpb_link(this.props.state, true);
      history.push(new_url);
    }

  }
);

const url_state_selector = createSelector(_.identity, str => {
  let state =  {};
  if(_.nonEmpty(str)){
    state = _.chain(str)
      .pipe(str => JSURL.parse(str) )
      .pipe(naive=> naive_to_real_state(naive) )
      .value();
  } else {
    state = naive_to_real_state({});
  }
  return state;
});

export class ReportBuilder extends React.Component { 
  constructor(props){
    super(props);
    const config_str = this.props.match.params.config;
    this.state = {
      loading: !!(url_state_selector(config_str).table),
    }
  }
  loadDeps({table, subject}){
    this.setState({
      loading: true,
    });

    ensure_loaded({
      table_keys: [table],
      footnotes_for: 'all',
    }).then(()=> {
      this.setState({
        loading: false,
      });
    });
  }
  componentWillMount(){
    const config_str = this.props.match.params.config;
    const state = url_state_selector(config_str);
    if(state.table){
      this.loadDeps(state);
    }
  }
  shouldComponentUpdate(nextProps,nextState){
    if(this.state.loading !== nextState.loading){
      return true;
    }
    const old_config_str = this.props.match.params.config;
    const new_config_str = nextProps.match.params.config;
    return old_config_str !== new_config_str;
  }
  componentWillUpdate(nextProps){
    const old_config_str = this.props.match.params.config;
    const old_state = url_state_selector(old_config_str);
    const new_config_str = nextProps.match.params.config;
    const new_state =url_state_selector(new_config_str);

    if(new_state.table && old_state !== new_state.table){  
      this.loadDeps(new_state);
    }
    
  }
  render(){
    const config_str = this.props.match.params.config
    const title = text_maker("report_builder_title");

    const state = url_state_selector(config_str);

    return (
      <StandardRouteContainer 
        title={title}
        breadcrumbs={[text_maker("self_serve")]}
        description={text_maker("report_builder_meta_desc")}
        route_name="_rpb"
        shouldSyncLang={false}
      >
        <AnalyticsSynchronizer {...state} />
        { 
          this.state.loading ? 
          <SpinnerWrapper scale={3} /> :
          <Root state={state} />
        }
      </StandardRouteContainer>
    )
  }
}