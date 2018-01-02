module.exports = exports;
'use strict';

const { PanelGraph } = require('../core/graphs.js');
const {text_maker} = require('../models/text.js');

/* usage:
  renderPanelCollection
    .then(()=> {
      cleanup/post render
        * Is there any standard behaviour for cleanup that should be handled here? 
        * ex: applying flexbox once height is known
      this.bubbleMenu.stop() //can signal parent component, e.g. to stop spinner in the bubble menu
    })
*/


/*
  we treat this as a component, but since it's stateless, it's a function, not a class.
  it returns a promise resolved when it is done rendering.
  it is entirely self-contained, just pass it a *regular div node*
    * no need to create panels beforehand
    * no need to center text afterwards
*/
function tabbable_div_with_id(id, options){
  const el = document.createElement('div'); //Note: this div is the "root" from the React panels in panel_components.js
  el.setAttribute('id', id);
  el.setAttribute('tabindex', -1);

  el.style.overflow = 'hidden';
  el.style.marginBottom = '5px';


  return el;
}



function renderPanelCollection(container,subject,panels,options={}){
  container.innerHTML = "";
  let graph_options = {};
  //promise chain the renders 
  return panels.reduce(
    (prev,graph) => {
      const el = tabbable_div_with_id(graph.key, options);

      return prev.then(()=> {
        const calculations = graph.calculate(subject, _.clone(graph_options));
        const def = $.Deferred();
        if(calculations){
          container.appendChild(el);
          setTimeout(()=> {
            graph.render( d4.select(el), calculations, _.clone(graph_options) );
            def.resolve();
          });
          //return PanelGraph.async_render(graph,d4.select(el),subject,options_for_graph);
          return def;
        } else {
          return $.Deferred().resolve();
        }
      });
    },
    $.Deferred().resolve()
  )
}

class ReactPanelGraph extends React.Component {
  _render(){
    let {
      subject,
      graph_key,
      graph_options,
    } = this.props;  

    const { main } = this.refs;

    const graph_obj = PanelGraph.lookup(graph_key, subject.level)


    graph_options = graph_options || {};

    const calculations = graph_obj.calculate(subject, graph_options);

    if(!calculations){
      main.innerHTML = "";
      return;
    }
     
    graph_obj.render( d4.select(main), calculations, graph_options);

    
  }
  componentDidMount(){
    this._render();
  }
  componentDidUpdate(){
    this._render();
  }
  render(){
    const { graph_key } = this.props;
    return (
      <div 
        ref="main"
        id={graph_key}
        className="infograph-panel-container"
      />
    );
  }
}


const no_matching_panel = function( container, options={} ){

  d4.select(container)
    .html("")
    .append("div")
    .classed("well",true)
    .styles({
      "display" : "flex",
      "justify-content" : "center",
      "height" : "100%",
      "margin-bottom": "15px",
    })
    .append("span")
    .styles({
      "font-size" : "24px",
      "align-self" : "center",
    })
    .html(text_maker("no_matching_data"));


};

//this is function and not a class because it is stateless. 
//If you want to change panel selection or subject, run the function again.
const defaultDelay = 300;
const statelessDoublePanelView = ({
  container, 
  right_subject, 
  left_subject, 
  panel_keys, 
  onComplete, //callback is called when everything is done rendering
  delay,
  noPanelMessage="",
}) => {
  delay = delay || defaultDelay;
  container.innerHTML = "";
  if(!right_subject && !left_subject){ 
    return; 
  }
  /*
    build a data-structure of the form...
    [ 
      {
        graph_key,
        right: graphObj, 
        left: graphObj, 
      }
    ]
    the array indicates the order in which things should be displayed.
    then, we run through the array appending elements to the container.

  */

  const panel_options = {
    layout: 'half',
  };

  _.reduce(
    panel_keys, 
    (promise_chain,graph_key) => promise_chain.then(()=>{

      const right_graph = right_subject && PanelGraph.lookup( graph_key, right_subject.level);
      const right_calc = right_graph && right_graph.calculate(right_subject, _.clone(panel_options));

      const left_graph = left_subject &&  PanelGraph.lookup( graph_key, left_subject.level);
      const left_calc =  left_graph && left_graph.calculate(left_subject, _.clone(panel_options));

      if(!right_calc && !left_calc){ 
        return; 
      }
      const single_render_prom = $.Deferred();
      
      setTimeout(()=>{

        const el =  document.createElement('div');
        const left_el =  document.createElement('div');
        const right_el =  document.createElement('div');
        const clr_fix = document.createElement('div')
        el.classList.add('row');
        el.classList.add('equal-height-cols');
        el.classList.add('compare-row');

        left_el.classList.add('left');
        left_el.classList.add('col-lg-6');
        left_el.classList.add('compare-container');

        right_el.classList.add('col-lg-6');
        right_el.classList.add('right');
        right_el.classList.add('compare-container');

        clr_fix.classList.add('clearfix')
        el.appendChild(left_el); 
        el.appendChild(right_el); 
        el.appendChild(clr_fix);
        container.appendChild(el);

        if(left_calc){
          left_graph.render(d4.select(left_el),left_calc, _.clone(panel_options) )
        } else {
          no_matching_panel(left_el)
        }

        if(right_calc){
          right_graph.render(d4.select(right_el), right_calc, _.clone(panel_options))
        } else {
          no_matching_panel(right_el)
        }

        single_render_prom.resolve();
      }, delay );    

      return single_render_prom;
    }),
    $.Deferred().resolve()
  ).then(()=>{
    if(_.isEmpty(container.querySelectorAll('.panel'))){
      container.innerHTML = noPanelMessage;
    }

    d4.select(container)
      .selectAll('.compare-row')
      .each(function(sel){
        const left_heading = this.querySelector('.left .panel-heading')
        const right_heading = this.querySelector('.right .panel-heading')

        //did both panels render? then make their header height match.
        if(left_heading && right_heading){ 
          const new_heading_height = _.max([left_heading.offsetHeight, right_heading.offsetHeight])
          left_heading.style.height = new_heading_height+'px';
          right_heading.style.height = new_heading_height+'px';
        }

      })

    d4.select(container)
      .selectAll('.right .panel-info')
      .classed('panel-info', false)
      .classed('panel-success', true);
    
    onComplete()

  });

}

module.exports = exports = {
  renderPanelCollection,
  statelessDoublePanelView,
  ReactPanelGraph,
};
