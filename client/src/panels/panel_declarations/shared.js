import './shared.scss';

import { InfographicPanel, StdPanel, TextPanel, Col } from './InfographicPanel.js';

import { formats, dollar_formats, formatter } from '../../core/format.js';
import { PanelRegistry, layout_types } from '../PanelRegistry.js';
import { newIBCategoryColors, newIBLightCategoryColors, newIBDarkCategoryColors, NA_color } from '../../core/color_schemes.js';
import { breakpoints } from '../../core/breakpoint_defs.js';
import { Table } from '../../core/TableClass.js';
import { Statistics } from '../../core/Statistics.js';
import { ensure_loaded } from '../../core/lazy_loader.js';

import * as Results from '../../models/results.js';
import { create_text_maker, trivial_text_maker, run_template } from '../../models/text.js';
import { Subject } from '../../models/subject';
import { years } from '../../models/years.js';
import { businessConstants } from '../../models/businessConstants.js';
import FootNote from '../../models/footnotes.js'; 
import { GlossaryEntry } from '../../models/glossary.js';

import * as declarative_charts from '../../charts/declarative_charts.js';
import { NivoResponsiveBar, NivoResponsiveHBar, NivoResponsiveLine, NivoResponsivePie, get_formatter } from '../../charts/NivoCharts.js';
import { Canada } from '../../charts/canada.js';
import { FlatTreeMapViz } from '../../charts/flat_treemap/FlatTreeMapViz.js';

import { rpb_link, get_appropriate_rpb_subject } from '../../rpb/rpb_link.js';
import { infograph_href_template as infograph_href_template } from '../../infographic/routes.js';
import { get_source_links } from '../../metadata/data_sources.js';
import { glossary_href } from '../../link_utils.js';
import * as general_utils from '../../general_utils.js';
import * as util_components from '../../components/index.js';
import * as table_common from '../../tables/table_common.js';

import classNames from 'classnames';
import { Fragment } from 'react';

const {
  TabularPercentLegend,
  GraphLegend,
} = declarative_charts;

const {
  Format,
  HeightClipper,
  TabbedControls,
  TabbedContent,
  TM, 
  create_text_maker_component,
  SpinnerWrapper,
  DlItem,
} = util_components;


const declare_panel = ({panel_key, levels, panel_config_func}) => {
  if ( !PanelRegistry.is_registered_panel_key(panel_key) ){
    levels.forEach( 
      level => new PanelRegistry({
        level,
        key: panel_key,
        ...panel_config_func(level, panel_key),
      })
    );
  }

  return panel_key;
};

const infobase_colors_smart = (col_scale) => (label) => {
  if ( _.includes(businessConstants.NA_values,label) ){
    return NA_color;
  }
  return col_scale(label);
};

const get_planned_spending_source_link = subject => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.lookup('programSpending');
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: 'details',
      columns: ['{{planning_year_1}}'], 
    }),
  };
};
const get_planned_fte_source_link = subject => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.lookup('programFtes');
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: 'details',
      columns: ['{{planning_year_1}}'], 
    }),
  };
};


const CommonDonut = function({graph_data, legend_data, graph_height}){
  const color_scale = infobase_colors_smart( d3.scaleOrdinal().range(newIBCategoryColors) );

  const has_neg = _.chain(legend_data)
    .map('value')
    .min()
    .value() < 0;

  const legend_items = !has_neg && _.chain(legend_data)
    .sortBy('value')
    .reverse()
    .map( ({value, label }) => ({ 
      value,
      label,
      color: color_scale(label),
      id: label,
    }))
    .value();

  const total = d3.sum( legend_data, _.property('value') );

  return(
    <div aria-hidden = {true}>
      <div style = {{height: graph_height}}>
        <NivoResponsivePie
          data = {graph_data}
          colors = {({label}) => color_scale(label)}
          total = {total}
        />
      </div>
      { !has_neg && 
        <div className="centerer" style={{marginTop: "-40px"}}>
          <div 
            style={{
              width: "100%", /* IE 11 */ 
              maxWidth: '400px', 
              flexGrow: 1,
            }}
          >
            <TabularPercentLegend
              items={legend_items}
              get_right_content={
                (item) => (
                  <div style={{width: "120px", display: "flex"}}>
                    <div style={{width: "60px"}}>
                      <Format type="compact1" content={item.value} />
                    </div>
                    <div style={{width: "60px"}}>
                      <Format type="percentage1" content={(item.value)*Math.pow(total,-1)} />
                    </div>
                  </div>
                )
              }
            />
          </div>
        </div>
      }
    </div>
  );
};

class LineBarToggleGraph extends React.Component {
  constructor(props){
    super(props);

    this.extra_options_by_graph_mode = {
      bar_stacked: {
        bar: true,
        index: 'date',
        groupMode: 'stacked',
      },
      bar_normalized: {
        bar: true,
        normalized: true,
        formatter: formats.percentage1,
        groupMode: 'stacked',
        index: 'date',
      },
      bar_grouped: {
        bar: true,
        groupMode: 'grouped',
        index: 'date',
      },
      line: {
        bar: false,
        stacked: false,
      },
      line_stacked: {
        bar: false,
        stacked: true,
        enableArea: true,
      },
    };
    this.graph_modes = _.keys(this.extra_options_by_graph_mode);

    const colors = props.colors || props.get_colors();

    // d3 categorical scales memoize data --> color mappings
    // so this ensures that the mapping will be the same for
    // each sub-graph
    const set_graph_colors = (items) => _.each(
      items,
      (item) => colors(item.label)
    );
    set_graph_colors(props.data);

    this.state = {
      colors,
      selected: _.chain(props.data)
        .filter( ({active}) => _.isUndefined(active) || active )
        .map( ({label}) => label )
        .value(),
      graph_mode: props.initial_graph_mode,
    };
  }
  render(){
    const {
      data,

      legend_col_full_size,
      legend_col_class,
      legend_title,

      graph_col_full_size,
      graph_col_class,

      disable_toggle,
      formatter,
      graph_options,
    } = this.props;

    const {
      colors,
      selected,
      graph_mode,
      y_scale_zoomed,
    } = this.state;

    const extra_graph_options = this.extra_options_by_graph_mode[graph_mode];

    const series = _.chain(data)
      .filter( ({label}) => _.includes(selected, label) )
      .map( ({label, data }) => [ label, data ])
      .fromPairs()
      .value();
    
    const raw_data = _.flatMap(series, value => value);

    const data_bar = _.map(
      graph_options.ticks,
      (date, date_index) => ({
        ..._.chain(series)
          .map((data,label) => [label, data[date_index]])
          .fromPairs()
          .value(),
      })
    );

    const data_formatter_bar = (data) => _.map(
      data,
      (stacked_data, index) => ({
        ...stacked_data,
        date: graph_options.ticks[index],
      })
    ); 

    const normalize = (data) => _.map(
      data,
      (series) => {
        const series_total = _.reduce(series, (sum, value) => sum + value, 0);
        return( _.chain(series)
          .map((value, label) => [label, value/series_total])
          .fromPairs()
          .value());
      }
    );

    const data_formatter_line = _.map(
      series,
      (data_array, data_label) => ({
        id: data_label,
        data: _.map(
          data_array,
          (spending_value, tick_index) => ({
            x: graph_options.ticks[tick_index],
            y: spending_value,
          })
        ),
      })
    );

    const extended_graph_options_bar = {
      keys: Object.keys(series),
      data: extra_graph_options.normalized ? 
        data_formatter_bar(normalize(data_bar)) : 
        data_formatter_bar(data_bar),
      colors: ({id}) => colors(id),
      text_formatter: formatter || extra_graph_options.formatter,
      indexBy: extra_graph_options.index,
      is_money: !!extra_graph_options.is_money,
      groupMode: extra_graph_options.groupMode,
      raw_data,
      margin: {
        top: 30,
        right: 20,
        bottom: 65,
        left: 65,
      },
      bttm_axis: {
        tickSize: 3,
        tickRotation: -45,
        tickPadding: 10,
      },
    };

    const extended_graph_options_line = {
      data: data_formatter_line,
      colors: ({id}) => colors(id),
      raw_data,
      yScale: { 
        type: "linear",
        zoomed: y_scale_zoomed,
      },
      enableArea: !!extra_graph_options.enableArea,
      stacked: !!extra_graph_options.stacked,
      is_money: !!extra_graph_options.is_money,
      text_formatter: formatter || extra_graph_options.formatter,
      margin: {
        top: 30,
        right: 20,
        bottom: 65,
        left: 65,
      },
      bttm_axis: {
        tickSize: 3,
        tickRotation: -45,
        tickPadding: 10,
      },
    };

    return (
      <div className="frow">
        <div 
          className={classNames(`fcol-xs-12 fcol-md-${legend_col_full_size}`, legend_col_class)} 
          style={{ width: "100%", position: "relative" }}
        >
          <div
            className="legend-container"
            style={{ maxHeight: "400px" }}
          >
            { legend_title &&
              <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
                {legend_title}
              </p>
            }
            <GraphLegend
              items={
                _.map( 
                  data,
                  ({label}) => ({
                    label,
                    active: _.includes(selected, label),
                    id: label,
                    color: colors(label),
                  })
                )
              }
              onClick={label =>{
                !(selected.length === 1 && selected.includes(label)) &&
                  (this.setState({
                    selected: _.toggle_list(selected, label),
                  }));
              }}
            />
            { !disable_toggle &&
              <span className="centerer" style={{paddingBottom: "15px"}}>
                <button 
                  className="btn-ib-primary"
                  onClick={ 
                    () => {
                      const current_mode_index = _.indexOf(this.graph_modes, graph_mode);
                      const name_of_next_graph_mode = this.graph_modes[(current_mode_index+1) % this.graph_modes.length];
                      this.setState({
                        graph_mode: name_of_next_graph_mode,
                      });
                    }
                  }
                >
                  <TM k="toggle_graph"/>
                </button>
              </span>
            }
          </div>
        </div>
        <div 
          className={classNames(`fcol-xs-12 fcol-md-${graph_col_full_size}`, graph_col_class)} 
          style={{ width: "100%", position: "relative" }}
          tabIndex="-1"
        >
          <div style = {{height: '400px'}} aria-hidden = {true}>
            { extra_graph_options.bar?
                <NivoResponsiveBar { ...extended_graph_options_bar}/> :
                <NivoResponsiveLine {...extended_graph_options_line} /> }
          </div>
        </div>
      </div>
    );
  }
};
LineBarToggleGraph.defaultProps = {
  legend_col_full_size: 4,
  graph_col_full_size: 8,
  legend_class: false,
  graph_col_class: false,
  get_colors: () => infobase_colors_smart( d3.scaleOrdinal().range(newIBCategoryColors) ),
  initial_graph_mode: "bar_stacked",
};

const TspanLineWrapper = ({text, width, line_height=1}) => <Fragment>
  {
    _.chain(text)
      .thru( text => text.split(/\s+/) )
      .reduce(
        (lines, word) => {
          const [current_line, ...finished_lines] = _.reverse(lines);
          const potential_new_line = `${current_line} ${word}`;
          if (potential_new_line.length < width) {
            return [...finished_lines, potential_new_line];
          } else {
            return [...finished_lines, current_line, word];
          }
        },
        [""],
      )
      .map(
        (line, ix) =>
          <tspan key={ix} x={0} y={0} dy={ix > 0 ? line_height*ix + "em" : "0em"}>
            {line}
          </tspan> 
      )
      .value()
  }
</Fragment>;

const HeightClippedGraph = ({clipHeight, children}) => {
  return (
    <HeightClipper clipHeight={clipHeight || 185} allowReclip={true} buttonTextKey={"show_content"} gradientClasses={"gradient clipped-graph-gradient"}>
      {children}
    </HeightClipper>
  );
};


export {
  // re-exports
  Table,
  rpb_link,
  get_appropriate_rpb_subject,
  Subject,
  years,
  businessConstants,
  general_utils,
  FootNote,
  GlossaryEntry,
  util_components,
  Format,
  infograph_href_template,
  glossary_href,
  Results,
  Statistics,
  ensure_loaded,
  declarative_charts,
  formats,
  dollar_formats,
  formatter,
  trivial_text_maker,
  create_text_maker,
  run_template,
  StdPanel,
  TextPanel,
  InfographicPanel,
  Col,
  layout_types,
  TabbedControls,
  TabbedContent,
  TM,
  create_text_maker_component,
  DlItem,
  get_source_links,
  newIBCategoryColors,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
  NivoResponsiveBar,
  NivoResponsiveHBar,
  NivoResponsiveLine,
  NivoResponsivePie,
  Canada,
  FlatTreeMapViz,
  breakpoints,
  SpinnerWrapper,
  get_formatter,
  table_common,

  // shared panel utils
  declare_panel,
  infobase_colors_smart,
  get_planned_spending_source_link,
  get_planned_fte_source_link,

  // shared panel components
  CommonDonut,
  LineBarToggleGraph,
  HeightClippedGraph,
  TspanLineWrapper,
};
