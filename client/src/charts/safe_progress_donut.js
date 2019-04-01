import common_charts_utils from './common_charts_utils';
import { Bar } from './bar';
import { ProgressDonut } from './progress_donut.js';

const bar_options = {
  add_xaxis: true,                                   
  x_axis_line: true,                                
  add_yaxis: false,                                  
  add_labels: true,                                  
  margin: {top: 0, right: 0, left: 0, bottom: 0} ,
  formatter: common_charts_utils.formats.compact1,
};

export class SafeProgressDonut {

  constructor(container,options){
    // expect data to be in following format:
    // ```javascript
    //  this.data = [
    //    {value : 'data', label: "label"},
    //    {value : 'data', label: "label"},
    //  ]
    // ```
    //

    this.__container__ = container;
    this.options = options;
  }

  render(options){
    this.options = _.extend(this.options,options);
    const data = this.options.data;

    const min = _.chain(data)
      .map('value')
      .min()
      .value();

    if (min >= 0){
      this.__container__.innerHTML = "";
      new ProgressDonut(
        this.__container__, 
        _.clone(this.options)
      ).render();

    } else if (min < 0 && this.options.fallback !== 'none'){
      this.__container__.innerHTML = "";
      const options = {
        ...this.options,
        ...bar_options,
        series: { "": _.map(data, 'value')},
        ticks: _.map(data, 'label'), 
      };

      new Bar(
        this.__container__,
        options
      ).render();

    }
  }
};
