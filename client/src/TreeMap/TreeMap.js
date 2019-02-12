//https://gist.github.com/guglielmo/16d880a6615da7f502116220cb551498

import { StandardRouteContainer } from '../core/NavComponents.js';
import {
  Format,
  TM,
  SpinnerWrapper
} from '../util_components.js';
import { get_data } from './data.js';
import { formats } from '../core/format.js';
import './TreeMap.scss';
import { TreeMap } from './visualization.js';
import { TreeMapControls } from './TreeMapControls.js';
import AriaModal from 'react-aria-modal';
import { IndicatorDisplay } from '../panels/result_graphs/components.js'
import { infograph_href_template } from '../infographic/routes.js';
import {
  trivial_text_maker,
  run_template
} from '../models/text.js';
import { Fragment } from 'react';


/* NODE RENDERING FUNCTIONS */

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

/* const result_square_className = status_color => {
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

/* COLOUR SCALES */


/* function result_color_scale(node){
  return "#eee";
} */

// need this slightly tricky formulation because we only want to use part of the Blues scale (darkest colours
// are too dark for good contrast with the text)
const pos_d3_color_scale = d3.scaleSequential(d3.interpolateRgbBasis(d3.schemeBlues[9].slice(3,7)));
pos_d3_color_scale.clamp(true); // I'm not sure if this is the default
const neg_d3_color_scale = d3.scaleSequential(d3.interpolateRgbBasis(d3.schemeReds[9].slice(3,5)));
neg_d3_color_scale.clamp(true);
function standard_color_scale (node){
  let color_val;
  node.data.parent_amount ? color_val = node.data.amount/node.data.parent_amount * 2 : color_val = 0;
  if(node.data.amount < 0){
    return neg_d3_color_scale( -color_val );
  }
  return pos_d3_color_scale( color_val );
}

const d3_fte_scale = d3.scaleSequential(d3.interpolateRgbBasis(d3.schemeGreens[9].slice(3,7)));
d3_fte_scale.domain([0,10000]);
d3_fte_scale.clamp(true);
function fte_color_scale(node){
  //return d3_fte_scale(node.data.ftes/node.data.parent_ftes * 2 );
  return d3_fte_scale(node.data.ftes);
}

function get_color_scale(type,color_var){
  if(type === "org_results"){
    return null; //result_color_scale;
  } else if(type === "drf" && color_var === "ftes"){
    return fte_color_scale;
  } else {
    return standard_color_scale;
  }
}

/* TOOLTIPS */

function std_tooltip_render(tooltip_sel,color_var){
  tooltip_sel.html(function(d){
    let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">`;
    if(d.data.parent_amount){
      tooltip_html = tooltip_html + `
      <div>${formats.compact1(d.data.amount)}
      (${formats.percentage1(d.data.amount/d.data.parent_amount)} of ${d.data.parent_name})</div>`;
    } else{
      tooltip_html = tooltip_html + `
      <div>${formats.compact1(d.data.amount)}</div>`
    }
    if(d.data.ftes){
      if(d.data.parent_ftes){
        tooltip_html = tooltip_html + `
        <div>${formats.int(d.data.ftes)} ${trivial_text_maker("fte")}
        (${formats.percentage1(d.data.ftes/d.data.parent_ftes)} of ${d.data.parent_name})</div>`

      } else{
        tooltip_html = tooltip_html + `
        <div>${formats.compact1(d.data.ftes)}</div>`
      }
    }
    if(color_var=="ftes"){
      tooltip_html = tooltip_html + `
      ${generate_infograph_href(d,"people")}
      </div>`;
    } else {
      tooltip_html = tooltip_html + `
      ${generate_infograph_href(d,"financial")}
      </div>`;
    }
    return tooltip_html;
  })
}

function mobile_tooltip_render(tooltip_sel){
  tooltip_sel.html(function(d){
    let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">
    <div>${formats.compact1(d.data.amount)}</div>`;
    if(d.data.parent_amount){
      tooltip_html = tooltip_html + `
      <div>${formats.percentage1(d.data.amount/d.data.parent_amount)} of ${d.data.parent_name}</div>`;
    }
    tooltip_html = tooltip_html + `
    ${generate_infograph_href(d)}`
    if(d3.select(this.parentNode).classed("TreeMapNode__ContentBoxContainer--has-children")){
      tooltip_html = tooltip_html + `
      <button class="btn-primary">Zoom in</button>`
    }
    tooltip_html = tooltip_html + `
    </div>`;
    return tooltip_html;
  })
    .select("button")
    .on("click", function(d){
      d3.select(d).transition();
    })
}

function generate_infograph_href(d, data_area){
  if (d.data.subject ){
    return `<div style="padding-top: 10px">
      <a class="TM_Tooltip__link" href=${infograph_href_template(d.data.subject, data_area)}> ${ trivial_text_maker("see_the_infographic") } </a>
    </div>`;
  } else { return ''}
}

/* OLD RESULTS STUFF */

/* function create_results_tooltip_render_func(activate_modal){
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
} */

/* const render_modal = (node) => {
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
} */


export default class TreeMapper extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      loading: true,
    };
    //this.results_tooltip_render = create_results_tooltip_render_func(_.bind(this.activateModal,this));
  }
  componentWillMount(){
    this.set_data(this.props);
  }
  componentWillUpdate(nextProps){
    if(
      this.props.match.params.perspective !== nextProps.match.params.perspective ||
      this.props.match.params.org_id !== nextProps.match.params.org_id ||
      this.props.match.params.year !== nextProps.match.params.year ||
      this.props.match.params.vote_stat_type !== nextProps.match.params.vote_stat_type
    ){
      this.set_data(nextProps);
    }
  }
  /* activateModal(modal_args){
    this.setState({
      modal_args: modal_args,
    });
  } */
  set_data(props){
    const {
      match: {
        params: {
          perspective,
          org_id,
          year,
          vote_stat_type,
        },
      },
    } = props; 
    get_data(perspective,org_id,year,vote_stat_type).then( data => {
      this.setState({
        loading: false,
        data,
      });
    })
  }
  render(){
    const {
      match: {
        params: {
          perspective,
          color_var,
          year,
          vote_stat_type,
        },
      },
    } = this.props; 
    const { loading, data, modal_args } = this.state;
    const colorScale = get_color_scale(perspective, color_var);
    const { results_tooltip_render } = this; 

    const display_year = run_template("{{" + year + "}}");
    return (
      <StandardRouteContainer 
        route_key='start'
        title='tree map development'
      >
{/*         <AriaModal
          mounted={ !!modal_args }
          titleText="More details"
          getApplicationNode={()=>document.getElementById('app')}
          verticallyCenter={true}
          underlayStyle={{
            paddingTop: "50px",
            paddingBottom: "50px",
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
                lineHeight: 1.5,
                padding: "0px 20px 0px 20px",
                borderRadius: "5px",
                fontWeight: 400,
              }}
            >
              { render_modal(modal_args) }
            </div>
          }
        </AriaModal> */}
        { loading ? 
          <SpinnerWrapper ref="spinner" config_name={"route"} /> : 
          <div>
            <Fragment>
              <TreeMapControls
                perspective={perspective}
                color_var={color_var}
                year={year}
                vote_stat_type={vote_stat_type}
                history = { this.props.history }
              /> 
              <TreeMap 
                side_bar_title={display_year}
                data={data}
                colorScale={colorScale}
                color_var = { color_var }
                tooltip_render={
                  perspective === "org_results" ?
                  results_tooltip_render :
                  window.feature_detection.is_mobile() ? mobile_tooltip_render : std_tooltip_render
                }
                node_render={
                  perspective === "org_results" ?
                  null : //results_node_render :
                  std_node_render
                }
              />
            </Fragment>
            <div style={{marginBottom: "200px"}} />
          </div>
        }
      </StandardRouteContainer>
    );
  }
}