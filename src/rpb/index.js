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
const { reactAdapter } = require('../core/reactAdapter.js');
const AriaModal = require('react-aria-modal');


//specific view stuff
const { TablePicker } = require('./TablePicker.js');
const { SimpleView } = require('./simple_view.js');
const { GranularView } = require('./granular_view.js');
const { SubjectFilterPicker } = require('./shared.js');


//misc app stuff
const { rpb_link } = require('./rpb_link.js');
const ROUTER = require('../core/router.js');
const JSURL = require('jsurl');
window.JSURL = JSURL;
const analytics = require('../core/analytics.js');

const sub_app_name = "_rpb";



ROUTER.add_container_route(
  "rpb/:args:",
  sub_app_name,
  route_func
);

function route_func(container, args){
  this.add_crumbs([{html: text_maker("self_serve")}]);
  const title_prefix = text_maker('report_builder_title');
  this.add_title($('<h1>').html(title_prefix));
  const set_title = title_suffix => this.add_title($('<h1>').html(title_prefix+" - "+title_suffix));

  let initialState = {};
  if(args && args.length){
    initialState = _.chain(args)
      .pipe(str => JSURL.parse(str) )
      .pipe(naive=> naive_to_real_state(naive) )
      .value();
  } else {
    initialState = naive_to_real_state({});
  }

  if(initialState.table){
    reactAdapter.render(
      <SpinnerWrapper scale={3} />,
      container
    );

    ensure_loaded({ 
      table_keys: [ initialState.table ],
      footnotes_for: 'all',
    }).then( ()=> {

      reactAdapter.render(
        <div>
          <Root 
            initialState={initialState} 
            set_title={set_title}
          />
        </div>, 
        container
      );

    });

  } else {

    reactAdapter.render(
      <div>
        <Root 
          initialState={initialState} 
          set_title={set_title}
        />
      </div>, 
      container
    );
  }
}

class Root extends React.Component {
  render(){
    const { 
      initialState,
      set_title,
    } = this.props;

    const mapStateToProps = create_mapStateToProps();

    const Container = connect(mapStateToProps, mapDispatchToProps)(RPB)

    return (
      <Provider store={createStore(reducer,initialState)}>
        <Container 
          set_title={set_title}
        />
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
        this.slowScrollDown();
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
        this.slowScrollDown();
      })
    });
  }
  slowScrollDown(){
    document.querySelector('#'+sub_app_name).focus();
    const el = document.getElementById('rpb-main-content')
    d4.select(el)
      .transition()
      .duration(1000)
      .tween("uniquetweenname2", ()=>{
        const i = d4.interpolateNumber(0, el.getBoundingClientRect().top);
        return t => { window.scrollTo( 0, i(t) ); };
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


    return <div style={{minHeight:'800px', marginBottom: '100px'}}>
      <URLSynchronizer {...this.props} />
      <AnalyticsSynchronizer {...this.props} />
      <TitleSynchronizer {...this.props} />
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
                className="btn btn-ib-primary btn-lg"
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
                  this.slowScrollDown();
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

class TitleSynchronizer extends React.Component {
  render(){ return null; }
  componentDidMount(){
    this.updateTitleImperatively();
  }
  componentDidUpdate(){
    this.updateTitleImperatively();
  }
  shouldComponentUpdate(newProps){
    return newProps.table !== this.props.table || newProps.subject !== this.props.subject;
  }
  updateTitleImperatively(){
    const {
      table, 
      subject,
      set_title,
    } = this.props;

    if( !_.isEmpty(table) ){
      let title = table.title;
      if(subject !== Gov){
        title = `${title} - ${subject.name}`;
      }
      set_title(title);

    }
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
    analytics.log_standard_event({
      SUBAPP: sub_app_name,
      SUBJECT_GUID: this.props.subject.guid,
      MISC1: this.props.table.id,
      MISC2: this.props.mode,
    })


  }

}


class URLSynchronizer extends React.Component {
  //note that we do not update the URL when componentDidMount(). 
  //this is so that the URL isn't printed too often
  //alternatively, we *can* overwrite the URL in componentDidMount() using replaceState().
  render(){ return null; }
  shouldComponentUpdate(new_props){
    return !!(
      new_props.table && 
      rpb_link(this.props) !== rpb_link(new_props)
    )
  }
  componentDidMount(){
    this.updateURLImperatively();
  }
  componentDidUpdate(){
    this.updateURLImperatively();
  }
  updateURLImperatively(){
    const new_url = rpb_link(this.props)
    ROUTER.navigate(new_url, {trigger:false});

    
    //patch other lang to remove filters, which are not yet bilingual-proof
    const all_in_other_lang = window.lang === 'en' ? "Tout" : "All";
    const bilingual_proof_hash = rpb_link(_.immutate(this.props, { filter : all_in_other_lang }));

    const ref = $('#wb-lng a');
    if (ref.length > 0){
      const link = ref.attr("href").split("#")[0];
      ref.attr("href",[link,bilingual_proof_hash].join(""));
    }
  }

}
