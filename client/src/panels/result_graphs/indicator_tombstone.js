import { 
  declare_panel, 
  util_components,
  general_utils,
  TextPanel,
  formats,
} from '../shared';
import { ensure_loaded } from '../../core/lazy_loader.js';
const {
  LabeledTombstone,
  ExternalLink,
} = util_components;
import { SpinnerWrapper } from '../../components/SpinnerWrapper.js';
  
const { 
  sanitized_dangerous_inner_html,
  SafeJSURL
} = general_utils;

import { TM, text_maker } from './result_text_provider.js';

import { Result } from '../../models/results.js'

//TODO: once flat_table is merged, replace this with the new target_text functions
const get_target_from_indicator = (indicator) => {
  const {
    target_type,
    target_min,
    target_max,
    target_narrative,
  } = indicator;

  const display_type_by_data_type = {
    num: "result_num",
    num_range: "result_num",
    dollar: "dollar",
    dollar_range: "dollar",
    percent: "result_percentage",
    percent_range: "result_percentage",
  };
  switch(target_type){
    case 'num':
    case 'num_range':
    case 'dollar':
    case 'dollar_range':
    case 'percent':
    case 'percent_range': {
      if ( /range/.test(target_type) && (target_min && target_max) ){
        return `${text_maker("result_range_text")} ${formats[display_type_by_data_type[target_type]](target_min, {raw: true})} ${text_maker("and")} ${formats[display_type_by_data_type[target_type]](target_max, {raw: true})}`;
      } else if (target_min && target_max && target_min === target_max){
        return formats[display_type_by_data_type[target_type]](target_min, {raw: true});
      } else if (target_min && !target_max){
        return `${text_maker("result_lower_target_text")} ${formats[display_type_by_data_type[target_type]](target_min, {raw: true})}`; 
      } else if (!target_min && target_max){
        return `${text_maker("result_upper_target_text")} ${formats[display_type_by_data_type[target_type]](target_max, {raw: true})}`; 
      } else {
        return text_maker('unspecified_target');
      }
    }
    case 'text': {
      if ( _.isEmpty(target_narrative) ){
        return text_maker('unspecified_target');
      } else {
        return target_narrative;
      }
    }
    case 'tbd': {
      return text_maker('tbd_result_text');
    }
    default: {
      return text_maker('unspecified_target');
    }
  }
};

const format_target_string = (indicator) => {
  const target = get_target_from_indicator(indicator);
  return target + (indicator.measure ? `(${indicator.measure})` : '');
};


export const declare_indicator_fields_panel = () => declare_panel({
  panel_key: "indicator_fields",
  levels: ["crso","program"],
  panel_config_func: (level, panel_key) => ({
    calculate: _.constant(true),
    render({calculations, graph_options}){ 
      const { graph_args } = calculations;
      const { options } = graph_options;
      return <IndicatorInfo options />;
    },
  }),
});


class IndicatorInfo extends React.Component {
  constructor(){
    super();

    this.state = {
      loading: true,
    };
  }

  componentDidMount(){
    const { 
      subject,
      doc,
    } = this.props;

    ensure_loaded({
      subject,
      results: true,
      result_docs: [doc],
    })
      .then( () => this.setState({loading: false}) );
  }

  render(){
    const { 
      subject,
      doc,
      options,
    } = this.props;
    const { loading } = this.state;

    if (loading) {
      return (
        <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      const options_obj = SafeJSURL.parse(options);
      const indicator = Result.lookup(options_obj.indicator_id);
      debugger;
      const labels_and_items = _.chain(
        [
          ["indicator", indicator.name],
          ["methodology", indicator.methodology],
          ["target", format_target_string(indicator)],
        ]
      )
        .map( ([label_key, item]) => [text_maker(label_key), item] )
        .filter( ([label, item]) => item )
        .value();


      return (
        <TextPanel title={text_maker("indicator")}>
          <LabeledTombstone labels_and_items={labels_and_items} />
        </TextPanel>
      );
    }
  }
}
