import common_charts_utils from './common_charts_utils.js';
import { Pie } from './pie.js';
import { Bar } from './bar.js';

const bar_options = {
  add_xaxis: true,                                   
  x_axis_line: true,                                
  add_yaxis: false,                                  
  add_labels: true,                                  
  margin: {top: 20, right: 20, left: 60, bottom: 80} ,
  formater: common_charts_utils.formats.compact1,
};

export class PieOrBar {

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
    this.__container__ = container;
    this.options = options;
    this.graph_type = Pie;
    this.graph = new Pie(this.__container__, this.options);
  }

  render(options){
    this.options = _.extend(this.options,options);
    const data_attr = this.options.data_attr || "value";
    const label_attr = this.options.label_attr || "label";
    const data = this.options.data;
    const min = _.min(data, data_attr)[data_attr];
    if (min >= 0 && this.graph_type === Bar){
      this.reset();
      this.graph_type = Pie;
      this.graph = new Pie(this.__container__, this.options);
    } else if (min < 0 && this.graph_type === Pie) {
      this.reset();
      const colors = this.options.color;
      this.options = _.clone( bar_options );
      this.graph_type = Bar;
      this.options.colors = colors;
      this.options.series = {"": _.map(data, data_attr)};
      this.options.ticks = _.map(data, label_attr);
      this.graph = new Bar(this.__container__,this.options );
    } else if (min < 0 && this.graph_type === Bar){
      this.options.data = {"": _.map(data, data_attr)};
      this.options.ticks = _.map(data, label_attr);
    }
    this.graph.render(this.options);
  }
  reset(){
    delete this.graph_type;
    this.__container__.innerHTML = "";
  }

};
