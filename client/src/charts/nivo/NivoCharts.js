import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { formats } from "../../core/format.js";
import { Fragment } from 'react';
import classNames from 'classnames';
import { IconZoomIn, IconZoomOut, IconTable } from '../../icons/icons.js';
import { create_text_maker } from '../../models/text.js';
import { breakpoints } from '../../core/breakpoint_defs.js';
import MediaQuery from 'react-responsive';
import {
  DisplayTable,
  StatelessModal,
  Format,
} from '../../components/index.js';
import { GraphLegend } from '../declarative_charts.js';
import { newIBCategoryColors } from '../../core/color_schemes.js';
import { infobase_colors_smart, get_formatter } from '../shared.js';
import './NivoCharts.scss';
import graph_text from './NivoCharts.yaml';

const text_maker = create_text_maker(graph_text);

const get_scale_bounds = (stacked, raw_data, zoomed) => {
  const min = _.min(raw_data);
  const max = _.max(raw_data);
  const scaled_min = min < 0 ? min * 1.05 : min * 0.95;
  const scaled_max = max < 0 ? max * 0.95 : max * 1.05;
  if(stacked){
    return {
      min: min < 0 ? scaled_min : 0,
      max: 'auto',
    };
  }
  return {
    min: zoomed || min < 0 ? scaled_min : 0,
    max: !zoomed && max < 0 ? 0 : scaled_max,
  };
};


const smalldevice_tooltip_content = (tooltip_item, formatter) => (
  <td>
    <div className="nivo-tooltip__content"> {tooltip_item.name || tooltip_item.id} </div>
    <div className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: formatter(tooltip_item.value)}} />
  </td>
);

const tooltip_content = (tooltip_item, formatter) => (
  <Fragment>
    <td className="nivo-tooltip__content"> {tooltip_item.name || tooltip_item.id} </td>
    <td className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: formatter(tooltip_item.value)}} />
  </Fragment>
);

const smalldevice_percent_tooltip_content = (tooltip_item, formatter, total) => (
  <td>
    <div className="nivo-tooltip__content">{tooltip_item.name || tooltip_item.id}</div>
    <div className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formatter(tooltip_item.value)}}/>
    <div className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formats.percentage1(Math.abs(tooltip_item.value)/total)}}/>
  </td>
);

const percent_tooltip_content = (tooltip_item, formatter, total) => (
  <Fragment>
    <td className="nivo-tooltip__content">{tooltip_item.name || tooltip_item.id}</td>
    <td className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formatter(tooltip_item.value)}}/>
    <td className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formats.percentage1(Math.abs(tooltip_item.value)/total)}}/>
  </Fragment>
);

const default_tooltip = (tooltip_items, formatter, total) => ( // total indicates percent value tooltip being used
  <div style={{color: window.infobase_color_constants.textColor}}>
    <table className="nivo-tooltip">
      <tbody>
        { tooltip_items.map(
          tooltip_item => ( 
            <tr key = {tooltip_item.id}>
              <td className="nivo-tooltip__content">
                <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.color}} />
              </td>
              <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
                {total ? percent_tooltip_content(tooltip_item, formatter, total) : tooltip_content(tooltip_item, formatter) }
              </MediaQuery>
              <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
                {total ? smalldevice_percent_tooltip_content(tooltip_item, formatter, total) : smalldevice_tooltip_content(tooltip_item, formatter)}
              </MediaQuery>
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
);

const fixed_symbol_shape = ({
  x, y, size, fill, borderWidth, borderColor,
}) => (
  <rect
    x={x}
    y={y}
    transform={window.feature_detection.is_IE() ? `translate(0 -4)` : ''}
    fill={fill}
    strokeWidth={borderWidth}
    stroke={borderColor}
    width={size}
    height={size}
    style={{ pointerEvents: 'none' }}
  />
);


const TabularPercentLegend = ({
  items, // [ { active, id, label, color }] 
  onClick, //id => { }
  get_right_content, //item => react element
}) => (
  <ul className="list-unstyled">
    {_.map(items, item => 
      <li
        key={item.id}
        className="tabular-legend-list-el"
      >
        <span 
          aria-hidden={true}
          className="legend-color-checkbox"
          style={{backgroundColor: item.color }}
        />
        <span>
          {item.label}
        </span>
        <span style={{marginLeft: 'auto', textAlign: 'right', whiteSpace: "nowrap"}}>
          { get_right_content(item) } 
        </span>
      </li>
    )}
  </ul>
);


const bar_table = (data, keys, indexBy, table_view_format, table_first_column_name) => {
  const table_data = _.map(data, row => ({
    display_values: _.chain(row)
      .toPairs()
      .map(r => r[0]===indexBy ? [indexBy, r[1]] : [r[0],table_view_format(r[1])] )
      .fromPairs()
      .value(),
    sort_values: {
      [indexBy]: row[indexBy],
      ...(_.omit(row, 'indexBy')),
    },
    search_values: {
      [indexBy]: row[indexBy],
    },
  }) );

  const ordered_column_keys = _.concat([indexBy],keys);
  const column_names = _.chain(ordered_column_keys)
    .zip( _.concat([table_first_column_name ? table_first_column_name : text_maker("label")], keys) )
    .fromPairs()
    .value();

  return <DisplayTable rows={table_data} ordered_column_keys={ordered_column_keys} column_names={column_names} name={"TODO"}/>;
};

class InteractiveGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show_table: false,
    };
  }

  render(){      
    const {
      show_table,
    } = this.state;

    const {
      graph,
      table,
      other_buttons,
    } = this.props;

    return (
      <Fragment>
        <div> {/* Don't get rid of this, need it for proper functioning of the child selectors on the buttons */}
          { table && 
            <button
              className={classNames("btn-ib-primary","btn-ib-array")}
              style={{
                zIndex: 999,
              }}
              onClick={ () => this.setState({ show_table: !show_table }) }
            >
              <IconTable
                title={text_maker("show_table")}
                color={window.infobase_color_constants.secondaryColor}
                alternate_color={window.infobase_color_constants.backgroundColor}
              />
            </button>
          }
          { _.map(other_buttons, (button,i) => <Fragment key={i}>{button}</Fragment> ) }
        </div>
        { graph }
        <StatelessModal
          show={ show_table }
          title={ text_maker("table_view") }
          body={ table }
          on_close_callback={() => this.setState({show_table: false})}
          additional_dialog_class = { (() => {
            if (window.innerWidth < breakpoints.minMediumDevice) { return 'modal-sm'; }
            if (window.innerWidth > breakpoints.maxLargeDevice ) { return 'modal-xl'; }
            return 'modal-lg';
          })() }
        />
      </Fragment>
    );
  }
}


const general_default_props = {
  tooltip: (d, tooltip_formatter) => default_tooltip(d, tooltip_formatter),
  percent_value_tooltip: (d, tooltip_formatter, total) => default_tooltip(d, tooltip_formatter, total),
  is_money: true,
  remove_bottom_axis: false,
  remove_left_axis: false,
  add_top_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
  disable_table_view: false,
  margin: {
    top: 50,
    right: 40,
    bottom: 50,
    left: 70,
  },
  graph_height: '400px',
  theme: {
    axis: {
      ticks: {
        text: { 
          fontSize: 12,
          fill: window.infobase_color_constants.textColor,
        },
      },
    },
    legends: {
      text: {
        fontSize: 12,
      },
    },
  },
};


export class NivoResponsivePie extends React.Component{
  render(){
    const {
      data,
      legend_data,
      graph_height,
      colors,
      theme,
      enableRadialLabels,
      enableSlicesLabels,
      tooltip,
      percent_value_tooltip,
      include_percent,
      total,
      margin,
      text_formatter,
      legends,
      startAngle,
      is_money,
      disable_table_view,
      display_horizontal,
    } = this.props;

    const IE_fixed_legends = legends ? (
      _.map(legends,
        legend => _.chain(legend)
          .clone()
          .assign({symbolShape: fixed_symbol_shape})
          .value() )
      ) :
      undefined;

    const color_scale = infobase_colors_smart( d3.scaleOrdinal().range(newIBCategoryColors) );
    const colorBy = d=>color_scale(d.label);

    const legend_items = _.chain(legend_data)
      .sortBy('value')
      .reverse()
      .map( ({value, label }) => ({ 
        value,
        label,
        color: color_scale(label),
        id: label,
      }))
      .value();
    
    const data_with_absolute_values = _.map(
      data,
      (data) => ({
        ...data,
        value: Math.abs(data.value),
        original_value: data.value,
      })
    );
    
    const legend_total = _.reduce(
      legend_data,
      (sum, {value}) => sum + Math.abs(value),
      0 
    );

    const table_data = _.map(data, row => ({
      display_values: {
        label: row["label"],
        percentage: formats.percentage_raw(row.value/legend_total),
        value: get_formatter(is_money, text_formatter, true, true)(row.value),
      },
      sort_values: {
        label: row["label"],
        percentage: row.value/legend_total,
        value: row.value,
      },
      search_values: {
        label: row["label"],
      },
    }) );
    
    const column_names = {
      label: text_maker("label"),
      value: text_maker("value"),
      percentage: text_maker("percentage"),
    };

    const ordered_column_keys = ["label", "value", "percentage"];

    const table = !disable_table_view && <DisplayTable rows={table_data} column_names={column_names} ordered_column_keys={ordered_column_keys} name={"TODO"} />;

    const graph =
    <div className={display_horizontal ? classNames("common-donut__horizontal","common-donut") : "common-donut"} aria-hidden = {true}>
      <div className="common-donut__graph" style = {{height: graph_height}}>
        <ResponsivePie
          {...{
            data: data_with_absolute_values,
            margin,
            colors,
            theme,
            startAngle,
            enableSlicesLabels,
            enableRadialLabels,
            colorBy,
          }}
          legends={ IE_fixed_legends }
          tooltip={ (data) => {
            const data_with_original_values = {
              ...data,
              value: data.original_value,
            };

            if (include_percent){
              return percent_value_tooltip(
                [data_with_original_values],
                get_formatter(is_money, text_formatter, false), 
                total
              );
            } else {
              return tooltip(
                [data_with_original_values],
                get_formatter(is_money, text_formatter, false)
              );
            } 
          }}
          innerRadius={0.5}
          borderWidth={1}
          borderColor="inherit:darker(0.2)"
          radialLabelsSkipAngle={0}
          animate={true}
          motionStiffness={30}
          motionDamping={15}
        />
      </div>
      <div className="common-donut__legend">
        <div className="centerer">
          <div className="centerer-IE-fix">
            <TabularPercentLegend
              items={legend_items}
              get_right_content={
                (item) => (
                  <div>
                    <span className="common-donut__legend-data">
                      <Format type="compact1" content={item.value} />
                    </span>
                    <span className="common-donut__legend-data">
                      <Format type="percentage1" content={item.value/legend_total} />
                    </span>
                  </div>
                )
              }
            />
          </div>
        </div>
      </div>
    </div>;
    

    return <InteractiveGraph graph={graph} table={table} />;
  }
}
NivoResponsivePie.defaultProps = {
  ...general_default_props,
  margin: {
    top: 30,
    right: 80,
    bottom: 60,
    left: 50,
  },
  include_percent: true,
  enableRadialLabels: false,
  enableSlicesLabels: false,
};

export class NivoResponsiveBar extends React.Component{
  render(){
    const{
      data,
      custom_table,
      keys,
      margin,
      graph_height,
      label_format,
      colors,
      bttm_axis,
      left_axis,
      isInteractive,
      indexBy,
      remove_bottom_axis,
      remove_left_axis,
      enableLabel,
      label,
      is_money,
      legends,
      tick_value,
      text_formatter,
      theme,
      colorBy,
      min,
      max,
      motion_damping,
      motion_stiffness,
      tooltip,
      enableGridX,
      groupMode,
      enableGridY,
      onMouseEnter,
      onMouseLeave,
      onClick,
      padding,
      animate,
      labelTextColor,
      borderWidth,
      disable_table_view,
      table_first_column_name,
    } = this.props;

    const IE_fixed_legends = legends ? (
      _.map(legends,
        legend => _.chain(legend)
          .clone()
          .assign({symbolShape: fixed_symbol_shape})
          .value() )
      ) :
      undefined;
  
    const table = !disable_table_view && (
      custom_table || bar_table(data, keys, indexBy, get_formatter(is_money, text_formatter, true, true), table_first_column_name)
    );

    // have to have an empty string in key to make sure that negative bars will be displayed
    const graph = 
      <div style={{height: graph_height }} aria-hidden='true'>
        <ResponsiveBar
          {...{data,
            margin,
            colors,
            groupMode,
            enableGridX,
            enableGridY,
            colorBy,
            theme, 
            indexBy, 
            enableLabel, 
            isInteractive,
            motion_damping,
            motion_stiffness,
            onMouseEnter,
            onMouseLeave,
            onClick,
            padding,
            tooltip,
            label,
            animate,
            labelTextColor,
            borderWidth,
          }}
          legends={ IE_fixed_legends }
          keys={_.union([''],keys)}
          labelFormat={_.isUndefined(label_format) ? null : label_format}
          tooltip={ (d) => tooltip( [d], get_formatter(is_money, text_formatter, false) ) }
          axisBottom={remove_bottom_axis ? null : bttm_axis}
          axisLeft={
            remove_left_axis ?
              null :
              {
                tickValues: tick_value || 6,
                format: (d) => get_formatter(is_money, text_formatter)(d),
                min: min,
                max: max,
                ...(left_axis || {}),
              }
          }
          borderColor="inherit:darker(1.6)"
        />
      </div>;
    
    return <InteractiveGraph graph={graph} table={table} />;
  }
};
NivoResponsiveBar.defaultProps = {
  ...general_default_props,
  padding: 0.3,
  bttm_axis: {
    tickSize: 7,
    tickPadding: 10,
    tickRotation: 0,
  },
  labelTextColor: "inherit:darker(2)",
  isInteractive: true,
  motion_damping: 15,
  motion_stiffness: 95,
  table_switch: false,
};



export class NivoResponsiveHBar extends React.Component{
  render(){
    const{
      data,
      keys,
      margin,
      graph_height,
      label_format,
      colors,
      bttm_axis,
      left_axis,
      top_axis,
      isInteractive,
      indexBy,
      remove_bottom_axis,
      remove_left_axis,
      add_top_axis,
      enableLabel,
      is_money,
      legends,
      tick_value,
      text_formatter,
      theme,
      colorBy,
      motion_damping,
      motion_stiffness,
      tooltip,
      enableGridX,
      groupMode,
      enableGridY,
      padding,
      label,
      labelSkipWidth,
      markers,
      disable_table_view,
      table_first_column_name,
    } = this.props;
    
    const IE_fixed_legends = legends ? (
      _.map(legends,
        legend => _.chain(legend)
          .clone()
          .assign({symbolShape: fixed_symbol_shape})
          .value() )
      ) :
      undefined;

    const table = !disable_table_view && bar_table(data, keys, indexBy, get_formatter(is_money, text_formatter, true, true), table_first_column_name);

    //have to have an empty string in key to make sure
    //that negative bars will be displayed
    const graph = 
    <div className="centerer" style={{height: graph_height}} aria-hidden='true'>
      <ResponsiveBar
        {...{data,
          margin,
          colors,
          groupMode,
          enableGridX,
          enableGridY,
          colorBy,
          theme, 
          indexBy, 
          enableLabel, 
          label,
          isInteractive,
          labelSkipWidth,
          markers,
        }}
        legends = { IE_fixed_legends }
        layout = 'horizontal'
        keys = {_.union([''],keys)}
        labelFormat={_.isUndefined(label_format) ? null : label_format}
        tooltip={ (d) => tooltip( [d], get_formatter(is_money, text_formatter, false) ) }
        axisBottom={remove_bottom_axis ? null : bttm_axis}
        axisTop={add_top_axis ? top_axis : null}
        axisLeft={
          remove_left_axis ?
            null :
            {
              tickValues: tick_value || 6,
              format: (d) => get_formatter(is_money, text_formatter)(d),
              min: "auto",
              max: "auto",
              ...(left_axis || {}),
            }
        }
        padding={padding}
        borderColor="inherit:darker(1.6)"
        motionDamping={motion_damping}
        motionStiffness={motion_stiffness}
        labelTextColor={window.infobase_color_constants.textColor}
        labelSkipWidth={labelSkipWidth}
      />
    </div>;


    return <InteractiveGraph graph={graph} table={table} />;
  }
};
NivoResponsiveHBar.defaultProps = {
  ...general_default_props,

  bttm_axis: {
    tickSize: 7,
    tickPadding: 10,
  },
  theme: {
    legends: {
      text: {
        fontSize: 14,
      },
    },
    labels: {
      text: {
        fontSize: 14,
      },
    },
  },
  isInteractive: true,
  max: "auto",
  min: "auto",
  padding: 0.3,
  motion_damping: 15,
  motion_stiffness: 95,
  labelSkipWidth: 10,
};

export class NivoResponsiveLine extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      y_scale_zoomed: false,
    };
  }
  render(){
    const {
      data,
      is_money,
      raw_data,
      margin,
      graph_height,
      tick_amount,
      colors,
      colorBy,
      max,
      min,
      enableArea,
      enableGridX,
      enableGridY,
      left_axis,
      disable_yaxis_zoom,
      yScale,
      motion_damping,
      motion_stiffness,
      enableDotLabel,
      remove_bottom_axis,
      remove_left_axis,
      bttm_axis,
      text_formatter,
      stacked,
      theme,
      tooltip,
      markers,
      legends,
      layers,
      disable_table_view,
      table_first_column_name,
    } = this.props;

    const {
      y_scale_zoomed,
    } = this.state;

    const IE_fixed_legends = legends ? (
      _.map(legends,
        legend => _.chain(legend)
          .clone()
          .assign({symbolShape: fixed_symbol_shape})
          .value() )
      ) :
      undefined;
    
    const table_data = _.map(data, row => ({
      display_values: _.chain(row.data)
        .map(d => [d.x,get_formatter(is_money, text_formatter, true, true)(d.y)])
        .fromPairs()
        .assign({label: row.id})
        .value(),
      sort_values: _.chain(row.data)
        .map(d => [d.x,d.y])
        .fromPairs()
        .assign({label: row.id})
        .value(),
      search_values: {
        label: row.id,
      },
    }) );
    const last_column_keys = _.chain(data)
      .map( d=>_.map( d.data, d=>d.x ) )
      .flatten()
      .uniq()
      .value();
    const ordered_column_keys = _.concat(['label'], last_column_keys);
  
    const column_names = _.chain(ordered_column_keys)
      .zip( _.concat([table_first_column_name ? table_first_column_name : text_maker("label")], last_column_keys) )
      .fromPairs()
      .value();

    const table = !disable_table_view && <DisplayTable rows={table_data} column_names={column_names} ordered_column_keys={ordered_column_keys} name={"TODO"}/>;

    const zoom_button = (!disable_yaxis_zoom && !enableArea) ?
      <button
        className={classNames("btn-ib-primary","btn-ib-array")}
        onClick={ 
          () => {
            this.setState({
              y_scale_zoomed: !y_scale_zoomed,
            });
          }
        }
      >
        { this.state.y_scale_zoomed ? 
            <IconZoomOut
              title={text_maker("zoom_out")}
              color={window.infobase_color_constants.secondaryColor}
              alternate_color={window.infobase_color_constants.backgroundColor}
            /> : 
            <IconZoomIn 
              title={text_maker("zoom_in")}
              color={window.infobase_color_constants.secondaryColor}
              alternate_color={window.infobase_color_constants.backgroundColor}
            />
        }
      </button> :
      undefined;

    const graph =
      <div style={{height: graph_height }} aria-hidden='true'>
        <ResponsiveLine
          {...{
            data,
            margin,
            enableGridX,
            enableGridY,
            enableArea,
            colorBy,
            colors,
            theme,
            enableDotLabel,
            markers,
            layers,
          }}
          legends={ IE_fixed_legends }
          tooltip={ (d) => tooltip( d, get_formatter(is_money, text_formatter, false) ) }
          yScale={{
            stacked: !!stacked,
            type: "linear",
            min: min || get_scale_bounds(stacked, raw_data, y_scale_zoomed).min,
            max: max || get_scale_bounds(stacked, raw_data, y_scale_zoomed).max,
            ...(yScale || {}),
          }}
          axisBottom={remove_bottom_axis ? null : bttm_axis}
          axisLeft={remove_left_axis ? null :
          {
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickValues: tick_amount || 6,
            format: d => get_formatter(is_money, text_formatter)(d),
            ...(left_axis || {}),
          }}
          axisTop={null}
          axisRight={null}
          xScale={{ type: "point" }}
          animate={true}
          motionStiffness={motion_stiffness}
          motionDamping={motion_damping}
          dotSize={stacked ? 0 : 10}
          areaOpacity={stacked ? 1 : 0}
        />
      </div>;

    return <InteractiveGraph graph={graph} table={table} other_buttons={[zoom_button]}/>;
  }
}
NivoResponsiveLine.defaultProps = {
  ...general_default_props,
  tooltip: (slice, tooltip_formatter) => default_tooltip(
    slice.data.map( 
      (d) => ({
        id: d.serie.id,
        color: d.serie.color,
        value: d.data.y,
      })
    ), 
    tooltip_formatter,
  ),
  colors: window.infobase_color_constants.textColor,
  bttm_axis: {
    tickSize: 7,
    tickPadding: 12,
  },
  enableDotLabel: false,
  enableArea: false,
  stacked: false,
  disable_yaxis_zoom: false,
  yScale: {
    type: "linear",
    zoomed: false,
    toggle: false,
  },
  motion_damping: 19,
  motion_stiffness: 100,
};

export class LineBarToggleGraph extends React.Component {
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
      colorBy: d => colors(d.id),
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
      colorBy: d => colors(d.id),
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
                  {text_maker("toggle_graph")}
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

