/*NOTES: 
1. this breaks the 'graphs do not depend on external modules' thing
Though one could argue formats shouldn't rely on the infobase either
2. this graph expects the data property to be an array [ { value: , label: } ] , it doesn't actually use label, it's just for consistency
3. It does not use html for its text so it might have issues with utf-8 and line wrapping 
4. This graph has very limited customization options, you can't really supply anything else than colors
5. A good addition of this graph could be to accommodate fractions
*/

import { formats } from '../core/format.js';
import common_charts_utils from './common_charts_utils';

export class ProgressDonut {
  
  constructor(container,options){
  
    common_charts_utils.setup_graph_instance(this,d3.select(container),options);
    const _graph_area = this.svg.append("g").attr("class","_graph_area");
    this.graph_area = _graph_area.append("g").attr("class","inner_graph_area");
    
  }
  render(options){
    this.options = _.extend(this.options,options);

    this.svg.attrs({ 
      width : this.outside_width, 
      height : this.outside_height,
    });

    this.options.font_size || 30;
    const colors = this.options.colors || infobase_colors();
    const color = colors(0);
    const background_arc_color = colors(1);
    const text_color = this.options.text_color || color;

    const outerRadius = 0.8*(Math.min(this.outside_width, this.outside_height)/2);
    const innerRadius = outerRadius*0.80;
    const fontSize = 0.75*innerRadius;

    const pct_formatter = this.options.pct_formatter || formats.percentage_raw;

    const TAU = 2*Math.PI;

    if(window.is_dev_build && this.options.data.length !== 2) { 
      /* eslint-disable no-console */
      console.error("progress donut not being used properly") 
    }

    const numbers = _.map(this.options.data, 'value');
    const number = _.min( numbers )/_.max(numbers);
    const percent_text = pct_formatter(number);

    const endAngle = Math.abs(TAU*number);

    this.graph_area.selectAll('*').remove();


    const pie_area = this.graph_area
      .attr("transform", "translate(" + (this.outside_width/2 )+ "," + this.outside_height/2 + ")");

    const angle_to_arc_attr = angle => d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(angle);

  
    //background circle
    pie_area
      .append('path')
      .attrs({ 
        d: angle_to_arc_attr(TAU),
      })
      .styles({ 
        fill:background_arc_color,
      });

    //leading circle
    pie_area.
      append('path')
      .attrs({
        d: angle_to_arc_attr(endAngle),
      })
      .styles({
        fill: color,
      });

    //add the text in the center
    pie_area.
      append('text')
      .text(percent_text)
      .attrs({
        class:'middleText',
        'text-anchor':'middle',
        dy: 0.25*fontSize,
        dx: 0.25*fontSize,
      })
      .styles({
        fill:text_color,
        'font-size':fontSize+'px',
      });

    return this;
  }
};

