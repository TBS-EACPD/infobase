import graph_text from './nivo_common.yaml';

import { Fragment } from 'react';
import MediaQuery from 'react-responsive';
import classNames from 'classnames';

import { breakpoints } from '../../core/breakpoint_defs.js';
import { formats } from "../../core/format.js";
import { get_formatter, infobase_colors_smart } from '../shared.js';
import { IconTable } from '../../icons/icons.js';
import { StatelessModal } from '../../components/index.js';
import { create_text_maker } from '../../models/text.js';

const nivo_common_text_maker = create_text_maker(graph_text);


const fixed_symbol_shape = ({x, y, size, fill, borderWidth, borderColor}) => (
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
const fix_legend_symbols = (legends) => legends ?
  _.map(
    legends,
    legend => _.chain(legend)
      .clone()
      .assign({symbolShape: fixed_symbol_shape})
      .value()
  ) :
  undefined;


const TooltipFactory = ({tooltip_items, TooltipContentComponent}) => (
  <div style={{color: window.infobase_color_constants.textColor}}>
    <table className="nivo-tooltip">
      <tbody>
        { tooltip_items.map(
          tooltip_item => ( 
            <tr key = {tooltip_item.id}>
              <td className="nivo-tooltip__content">
                <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.color}} />
              </td>
              <TooltipContentComponent
                tooltip_item={tooltip_item}
              />
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
);

const DefaultTooltip = ({tooltip_items, formatter}) => (
  <TooltipFactory
    tooltip_items={tooltip_items}
    TooltipContentComponent={
      ({tooltip_item}) => (
        <Fragment>
          <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
            <td className="nivo-tooltip__content"> {tooltip_item.name || tooltip_item.id} </td>
            <td className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: formatter(tooltip_item.value)}} />
          </MediaQuery>
          <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
            <td>
              <div className="nivo-tooltip__content"> {tooltip_item.name || tooltip_item.id} </div>
              <div className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: formatter(tooltip_item.value)}} />
            </td>
          </MediaQuery>
        </Fragment>
      )
    }
  />
);

const DefaultPercentTooltip = ({tooltip_items, formatter, total}) => (
  <TooltipFactory
    tooltip_items={tooltip_items}
    TooltipContentComponent={
      ({tooltip_item}) => (
        <Fragment>
          <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
            <td className="nivo-tooltip__content">{tooltip_item.name || tooltip_item.id}</td>
            <td className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formatter(tooltip_item.value)}}/>
            <td className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formats.percentage1(Math.abs(tooltip_item.value)/total)}}/>
          </MediaQuery>
          <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
            <td>
              <div className="nivo-tooltip__content">{tooltip_item.name || tooltip_item.id}</div>
              <div className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formatter(tooltip_item.value)}}/>
              <div className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formats.percentage1(Math.abs(tooltip_item.value)/total)}}/>
            </td>
          </MediaQuery>
        </Fragment>
      )
    }
  />
);


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
      table_name,
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
                title={nivo_common_text_maker("show_table")}
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
          title={ table_name || nivo_common_text_maker("default_table_name") }
          body={ table }
          on_close_callback={() => this.setState({show_table: false})}
          additional_dialog_class = {'modal-responsive'}
        />
      </Fragment>
    );
  }
}
  

const general_default_props = {
  tooltip: (d, formatter) => <DefaultTooltip 
    tooltip_items={d}
    formatter={formatter}
  />,
  percent_value_tooltip: (d, formatter, total) => <DefaultPercentTooltip
    tooltip_items={d}
    formatter={formatter}
    total={total}
  />,
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
  isInteractive: true,
  motionDamping: 15,
  motionStiffness: 95,
};

export {
  InteractiveGraph,
  TooltipFactory,
  DefaultTooltip,
  DefaultPercentTooltip,
  general_default_props,
  nivo_common_text_maker, 
  get_formatter,
  infobase_colors_smart,
  fix_legend_symbols,
};