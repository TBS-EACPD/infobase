//https://gist.github.com/guglielmo/16d880a6615da7f502116220cb551498

import { StandardRouteContainer } from '../core/NavComponents.js';
import { Format, TM } from '../util_components.js';
import { get_data } from './data.js';
import { formats } from '../core/format.js';
import './TreeMap.scss';
import { TreeMap } from './visualization.js';
import AriaModal from 'react-aria-modal';
import { IndicatorDisplay } from '../panels/result_graphs/components.js'
import { infograph_href_template } from '../link_utils.js';
import { trivial_text_maker } from '../models/text.js';


function std_node_render(foreign_sel){
  foreign_sel.html(function(node){
    if (this.offsetHeight <= 30 || this.offsetWidth < 50) { return }

    const name_to_display = ( node.data.subject && node.data.subject.fancy_acronym && this.offsetWidth < 150 ? node.data.subject.fancy_acronym : node.data.name );
    
    if(this.offsetHeight > 100){
      return `
        <div class="TreeMapNode__ContentBox TreeMapNode__ContentBox--standard">
        <div class="TreeMapNode__ContentTitle">
          ${name_to_display}
        </div>
        <div class="TreeMapNode__ContentText">
          ${formats.compact1(node.data.amount)}
        </div>
      </div>
    `
    } else if (this.offsetHeight > 50){
      return `
        <div class="TreeMapNode__ContentBox TreeMapNode__ContentBox--standard">
        <div class="TreeMapNode__ContentTitle TreeMapNode__ContentTitle--small">
          ${name_to_display}
        </div>
        <div class="TreeMapNode__ContentText TreeMapNode__ContentText--small">
          ${formats.compact1(node.data.amount)}
        </div>
      </div>
    `
    }
    else {
      return `
      <div class="TreeMapNode__ContentBox TreeMapNode__ContentBox--standard">
        <div class="TreeMapNode__ContentTitle TreeMapNode__ContentTitle--small">
          ${name_to_display}
        </div>
      </div>
    `
    }
  });
}

const result_square_className = status_color => {
  if(status_color === "success"){
    return "TreeMap_IndicatorGrid__Item TreeMap_IndicatorGrid__Item--success";
  } else if(status_color === "failure"){
    return "TreeMap_IndicatorGrid__Item TreeMap_IndicatorGrid__Item--failure";
  } else {
    return "TreeMap_IndicatorGrid__Item TreeMap_IndicatorGrid__Item--other";
  }
}
function results_node_render(foreign_sel){
  foreign_sel.html(function(d){
    const el = this;
    const { 
      offsetHeight: height,
      offsetWidth: width,
    } = el;
    const { indicators, name, resources } = d.data;

    let html;
    if(height < 20 || width < 50){//TODO pick a better cutoff, maybe based on height*width
      html = "";
    } else 
    if(_.isEmpty(indicators)){
      html = "no indicators";
    } else {
      const statuses = _.map(indicators, "status_color");

      let flexDirection = "row";
      if(height > width){
        flexDirection = "column";
      }

      html= `
        <div 
          class="TreeMap_IndicatorGrid"
          style="flex-direction: ${flexDirection};"
        >
          ${_.map(statuses, status_color => `
            <div class="${result_square_className(status_color)}"></div>
          `).join("")}
        </div>
        <div class="TreeMapNode__ContentBox TreeMapNode__ContentBox--standard" style="z-index:5">
          <div class="TreeMapNode__ContentTitle">
            ${name}
          </div>
          <div class="TreeMapNode__ContentText">
            ${formats.compact1(resources.spending)}
          </div>
        </div>
        </div>
        
      `;

    }
    return html;

  })
}

function result_color_scale(node){
  return "#eee";
}

const d3_color_scale = d3.scaleLinear()
  .range(["#1499FF","#b8e0ff"])
  .domain([0, innerWidth/2])
const neg_d3_color_scale = d3.scaleLinear()
  .range(["#FF6661","#ff8985"])
  .domain([0, innerWidth/4])
function standard_color_scale(node, chart_scale){
  if(node.data.amount < 0){
    return neg_d3_color_scale( chart_scale(node.x0) );
  }
  return d3_color_scale( chart_scale(node.x0) );
}

function std_tooltip_render(tooltip_sel){
  tooltip_sel.html(function(d){
    if(d.data.parent_amount){
      return `<div>
      <div>${d.data.name}</div>
      <hr class="BlueHLine">
      <div>${formats.compact1(d.data.amount)}</div>
      <div>${formats.percentage1(d.data.amount/d.data.parent_amount)} of ${d.data.parent_name}</div>
      ${generate_infograph_href(d)}
    </div>`
    } else {
      return `<div>
      <div>${d.data.name}</div>
      <hr class="BlueHLine">
      <div>${formats.compact1(d.data.amount)}</div>
      ${generate_infograph_href(d)}
    </div>`
    }
  })
}


function generate_infograph_href(d){
  if (d.data.subject ){
    return `<div style="padding-top: 10px">
      <a class="TM_Tooltip__link" href=${infograph_href_template(d.data.subject)}> ${ trivial_text_maker("see_the_infographic") } </a>
    </div>`;
  } else { return ''}
}

function create_results_tooltip_render_func(activate_modal){
  return function results_tooltip_render(tooltip_sel){
    tooltip_sel.html(d => `
      <div class="TM_Tooltip">
        <div>${d.data.name}</div>
        <hr class="BlueHLine">
        <div>${formats.compact1(d.data.amount)}</div>
        <div style="padding-bottom: 20px">
          <button class="btn-primary">Show more details</button>
        </div>
      </div>
    `)
      .select("button")
      .on("click", function(d){
        d3.event.stopPropagation();
        activate_modal(d);
      })
  }
}

const render_modal = (node) => {
  const { 
    name,
    indicators,
    resources,
  } = node.data;

  return <div>
    <div>{name}</div>
    <div> <TM k="drr_spending" /> : <Format type="compact_written" content={resources.spending} />  </div>
    <div> <TM k="drr_ftes" /> : <Format type="big_int_real" content={resources.ftes} /> </div>
    <div>
      <IndicatorDisplay indicators={indicators} />
    </div>
  </div>
}


export default class TreeMapper extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      loading: true,
    };

    this.results_tooltip_render = create_results_tooltip_render_func(_.bind(this.activateModal,this));

  }
  componentWillMount(){
    this.set_data(this.props);
  }
  componentWillUpdate(nextProps){
    if(
      this.props.match.params.perspective !== nextProps.match.params.perspective ||
      this.props.match.params.org_id !== nextProps.match.params.org_id
    ){
      this.set_data(nextProps);
    }
  }
  activateModal(modal_args){
    this.setState({
      modal_args: modal_args,
    });
  }
  set_data(props){
    const {
      match: {
        params : {
          perspective,
          org_id,
        },
      },
    } = props; 

    get_data(perspective,org_id).then( data => {
      this.setState({
        loading: false,
        data,
      });
    })
  }
  render(){
    const {
      match: {
        params : {
          perspective,
        },
      },
    } = this.props; 
    const { loading, data, modal_args } = this.state;
    const colourScale = (
      perspective === "org_results" ?
      result_color_scale : 
      standard_color_scale 
    );

    const { results_tooltip_render }  = this; 

    return (
      <StandardRouteContainer 
        route_key='start'
        title='tree map development'
      >
        <AriaModal
          mounted={ !!modal_args }
          titleText="More details"
          getApplicationNode={()=>document.getElementById('app')}
          verticallyCenter={true}
          underlayStyle={{
            paddingTop:"50px",
            paddingBottom:"50px",
          }}
          focusDialog={true}
          onExit={()=> this.setState({modal_args: null})}
        >
          
          { modal_args && 
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
              { render_modal(modal_args) }
            </div>
          }
        </AriaModal>
        { loading ? 
          <p> Loading... </p> : 
          <div>
            <TreeMap 
              side_bar_title={"2018-19"}
              data={data}
              colourScale={colourScale}
              tooltip_render={
                perspective === "org_results" ?
                results_tooltip_render :
                std_tooltip_render
              }
              node_render={
                perspective === "org_results" ?
                results_node_render :
                std_node_render
              }
            />
            <div style={{marginBottom: "200px"}} />
          </div>
        }
      </StandardRouteContainer>
    );
  }
}