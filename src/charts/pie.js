exports = module.exports;

var D3CORE = require('./core');

exports.pie = class PIE {
  
  constructor(container,options){
    // expect data to be in following format:
    // ```javascript
    //  this.data = [
    //    {some_attr : 'data', "another_attr": "label"},
    //    {some_attr : 'data', "another_attr": "label"},
    //    {some_attr : 'data', "another_attr": "label"},
    //  ]
    //  this.data_attr = "some_attr"
    //  this.label_attr = "another_attr"
    // ```
    //  in other words, it's up to the person calling this function
    //  to define what the label and data attrs will be
    //
    D3CORE.setup_graph_instance(this,d3.select(container),options);
    
    const _graph_area  = this.svg.append("g").attr("class","_graph_area");
    this.graph_area = _graph_area.append("g").attr("class","inner_graph_area");

  }
  
  render(options){
 
    this.options = _.extend(this.options,options);

    this.svg.attrs({ 
      "width" : this.outside_width, 
      "height" : this.outside_height,
    });
	
    let that = this;
    const showLabels = _.isUndefined(this.options.showLabels) ? true : this.options.showLabels;
    const html = this.html;
    const width = this.outside_width;
    const font_size = this.options.font_size || 11;
    const radius = this.options.radius || Math.min(this.outside_width, this.outside_height)/2-40;
    const color = this.options.color || infobase_colors();
    const data_attr = this.options.data_attr || "value";
    const label_attr = this.options.label_attr || "label";
    const title = this.options.title;
    // const inner_radius = this.options.inner_radius;


    // inner radius is set at 55% of radius
    // Font (definer later), is set using the radius and the inner radius
    const inner_radius = this.options.inner_radius ? radius * 0.55 : false;
    const inner_text = this.options.inner_text;
    const inner_text_content = this.options.inner_text_content;
    const inner_text_fmt = this.options.inner_text_fmt;

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(inner_radius || 0);

    const pie = d3.pie()
      .sort(null)
      .startAngle(this.options.start_angle || 0)
      .endAngle(this.options.end_angle || 2*Math.PI)
      .value(_.property(data_attr));

    const total = d3.sum(this.options.data,_.property(data_attr));

    const pct_formatter = this.options.pct_formatter;

    //filter out elements that are too small, cutoff is 0.1%
    
    const filtered_data = _.filter(this.options.data, record => Math.abs(record[data_attr]/total) > 0.001 );
    
    const pie_data = _.each(pie(filtered_data), (d,i,col) => {
      let label_length = 10+ radius;
      d.label_angle =  (d.endAngle - d.startAngle)/2 + d.startAngle;
      if (i>0 && (d.label_angle - col[i-1].label_angle) <Math.PI/5 ){
        label_length = col[i-1].label_length + 10;
      }
      d.label_length = label_length;

      // After correct label position calculated, adjust start and end angles so that each slice extends slightly underneath of subsequent slice, eliminates rough-looking gaps
      const pie_end_angle = that.options.end_angle || 2*Math.PI;
      const adjusted_slice_end = d.endAngle + 0.05;

      // All slices extend forward underneath of next slice, but never overlapping past pie_end_angle
      if( 
        ( 
          (d.startAngle < pie_end_angle) && (adjusted_slice_end < pie_end_angle) 
        ) || (
          (d.startAngle > pie_end_angle) && (adjusted_slice_end > pie_end_angle)
        )
      ){
        d.endAngle = adjusted_slice_end
      } else {
        d.endAngle = pie_end_angle - 0.001;
      }
      
      // First slice extends backwards slightly to fill underneath gap AT pie_end_angle       
      d.startAngle -= (i === 0) ? 0.05 : 0; 
    });
    
    const html_offset = {
      top : this.outside_height/2,
      left : this.outside_width/2,
    };

    if (title) {
      this.html.append("div")
        .attr("class", "title center-text")
        .style({
          "position" : "absolute",
          "top": "0px",
          "width" : width+"px",
        })
        .append("div")
        .html(title);
    }


    const graph_area  = this.graph_area
      .attr("transform", "translate(" + (width/2 )+ "," + this.outside_height/2 + ")");

    graph_area.selectAll(".arc").remove();


    const  g = graph_area
      .selectAll(".arc")
      .data(pie_data)

    const new_g = g
      .enter()
      .append("g")
      .attr("class", "arc");

    this.graph_area.selectAll('text').remove();

    if(inner_text){
      
      if(inner_text_content){
        const inner_text_words = inner_text_content.split(" ");

        const font_size = radius / 7;

        this.graph_area
          .selectAll("text")
          .data(inner_text_words)
          .enter()
          .append("text")
          .attr("text-anchor", "middle")
          .style("font-size", font_size + "px")
          .style("font-weight", "500")
          .attr('dy', (d,ix) => {
            const adjustment = inner_text_words.length%2 ? 0 : font_size;
            return adjustment + (-Math.floor(inner_text_words.length/2)+ix)*Math.ceil(font_size*1.5);
          })
          .text(_.identity);

      } else {
        this.graph_area
          .append("text")
          .attr("text-anchor", "middle")
          .style("font-size", radius / (.55 * 10) + "px")
          .attr('dy', 0.25*30)
          .text(inner_text_fmt(total))
      }
    }

    new_g
      .append("path")
      .attr("class", "arc_path");

                        
    if(showLabels){
      
      new_g
        .append("path")
        .attr("class", "line_path")
        .styles({
          "stroke-width" : "1px",
          "stroke" : "grey",
        })

      const pie_label = html
        .selectAll("div.pie-label")
        .data(pie_data)

      const new_pie_label = pie_label
        .enter()
        .append("div")
        .attr("class","pie-label")
      
      pie_label.merge(new_pie_label)

      new_pie_label
        .html(d => {
          if (d.data.hide_label){ 
            return "";
          } else if (pct_formatter){
            return (
              d.data[label_attr] ? 
              d.data[label_attr] + " - "  : 
              ""
            )+ pct_formatter(d.data[data_attr]/total);
          } else {
            return d.data[label_attr];
          }
        })
        .styles({
          "position" : "absolute",
          "font-size" : font_size+"px",
          "font-weight" : "500",
          "top" : (d,i) => {
            const lower = d.label_angle> Math.PI/2 && d.label_angle < Math.PI*3/2 ;
            const offset = lower ? 0 : - font_size - 10;
            return offset + html_offset.top + d.label_length * Math.sin(d.label_angle - Math.PI / 2)+"px";
          },
        })
        .each(function(d){
          var el = d3.select(this);
          var x = html_offset.left + d.label_length * Math.cos(d.label_angle - Math.PI / 2);
          if (d.label_angle > Math.PI){
            el.style("right", width - x + "px");
            el.style("text-align","right");
          } else {
            el.style("left", x + "px");
          }
        });


    }

    g.merge(new_g);

    new_g
      .select("path.arc_path")
      .attr("d", arc)
      .style("fill", d => color(d.data[label_attr]));

    if(showLabels){

      new_g.select("path.line_path")
        .attr("d", (d,i) => {
          if (d.data.hide_label){ return "";}
          const angle = d.label_angle;
          const diff = d.label_length;

          return d3.radialLine()([[angle, radius, diff],[angle,diff,0]])

        });
    }
    return this;
  }
};

