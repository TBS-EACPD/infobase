'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var d3Scale = require('d3-scale');
var min = _interopDefault(require('lodash/min'));
var max = _interopDefault(require('lodash/max'));
var range = _interopDefault(require('lodash/range'));
var flattenDepth = _interopDefault(require('lodash/flattenDepth'));
var d3Shape = require('d3-shape');
var React = require('react');
var React__default = _interopDefault(React);
var PropTypes = _interopDefault(require('prop-types'));
var compose = _interopDefault(require('recompose/compose'));
var withPropsOnChange = _interopDefault(require('recompose/withPropsOnChange'));
var pure = _interopDefault(require('recompose/pure'));
var core = require('@nivo/core');
var axes = require('@nivo/axes');
var legends = require('@nivo/legends');
var defaultProps = _interopDefault(require('recompose/defaultProps'));
var uniqBy = _interopDefault(require('lodash/uniqBy'));
var reactMotion = require('react-motion');
var setDisplayName = _interopDefault(require('recompose/setDisplayName'));

/**
 * Generates indexed scale.
 *
 * @param {Array.<Object>} data
 * @param {Function}       getIndex
 * @param {Array.<number>} range
 * @param {number}         padding
 * @returns {Function}
 */
var getIndexedScale = function getIndexedScale(data, getIndex, range$$1, padding) {
  return d3Scale.scaleBand().rangeRound(range$$1).domain(data.map(getIndex)).padding(padding);
};

/**
 * Generates scale for grouped bar chart.
 *
 * @param {Array.<Object>} data
 * @param {Array.<string>} keys
 * @param {number}         _minValue
 * @param {number|string}  _maxValue
 * @param {Array.<number>} range
 * @returns {Function}
 */
var getGroupedScale = function getGroupedScale(data, keys, _minValue, _maxValue, range$$1) {
    var allValues = data.reduce(function (acc, entry) {
        return [].concat(acc, keys.map(function (k) {
            return entry[k];
        }));
    }, []);

    var maxValue = _maxValue;
    if (maxValue === 'auto') {
        maxValue = max(allValues);
    }

    var minValue = _minValue;
    if (minValue === 'auto') {
        minValue = min(allValues);
        if (minValue > 0) minValue = 0;
    }

    return d3Scale.scaleLinear().rangeRound(range$$1).domain([minValue, maxValue]);
};

/**
 * Generates x/y scales & bars for vertical grouped bar chart.
 *
 * @param {Array.<Object>} data
 * @param {Function}       getIndex
 * @param {Array.<string>} keys
 * @param {number}         minValue
 * @param {number}         maxValue
 * @param {boolean}        reverse
 * @param {number}         width
 * @param {number}         height
 * @param {Function}       getColor
 * @param {number}         [padding=0]
 * @param {number}         [innerPadding=0]
 * @return {{ xScale: Function, yScale: Function, bars: Array.<Object> }}
 */
var generateVerticalGroupedBars = function generateVerticalGroupedBars(_ref) {
    var data = _ref.data,
        getIndex = _ref.getIndex,
        keys = _ref.keys,
        minValue = _ref.minValue,
        maxValue = _ref.maxValue,
        reverse = _ref.reverse,
        width = _ref.width,
        height = _ref.height,
        getColor = _ref.getColor,
        _ref$padding = _ref.padding,
        padding = _ref$padding === undefined ? 0 : _ref$padding,
        _ref$innerPadding = _ref.innerPadding,
        innerPadding = _ref$innerPadding === undefined ? 0 : _ref$innerPadding;

    var xScale = getIndexedScale(data, getIndex, [0, width], padding);
    var yRange = reverse ? [0, height] : [height, 0];
    var yScale = getGroupedScale(data, keys, minValue, maxValue, yRange);

    var barWidth = (xScale.bandwidth() - innerPadding * (keys.length - 1)) / keys.length;
    var yRef = yScale(0);

    var getY = function getY(d) {
        return d > 0 ? yScale(d) : yRef;
    };
    var getHeight = function getHeight(d, y) {
        return d > 0 ? yRef - y : yScale(d) - yRef;
    };
    if (reverse) {
        getY = function getY(d) {
            return d < 0 ? yScale(d) : yRef;
        };
        getHeight = function getHeight(d, y) {
            return d < 0 ? yRef - y : yScale(d) - yRef;
        };
    }

    var bars = [];
    if (barWidth > 0) {
        keys.forEach(function (key, i) {
            range(xScale.domain().length).forEach(function (index) {
                var x = xScale(getIndex(data[index])) + barWidth * i + innerPadding * i;
                var y = getY(data[index][key]);
                var barHeight = getHeight(data[index][key], y);

                if (barWidth > 0 && barHeight > 0) {
                    var barData = {
                        id: key,
                        value: data[index][key],
                        index: index,
                        indexValue: getIndex(data[index]),
                        data: data[index]
                    };

                    bars.push({
                        key: key + '.' + barData.indexValue,
                        data: barData,
                        x: x,
                        y: y,
                        width: barWidth,
                        height: barHeight,
                        color: getColor(barData)
                    });
                }
            });
        });
    }

    return { xScale: xScale, yScale: yScale, bars: bars };
};

/**
 * Generates x/y scales & bars for horizontal grouped bar chart.
 *
 * @param {Array.<Object>} data
 * @param {Function}       getIndex
 * @param {Array.<string>} keys
 * @param {number}         minValue
 * @param {number}         maxValue
 * @param {boolean}        reverse
 * @param {number}         width
 * @param {number}         height
 * @param {Function}       getColor
 * @param {number}         [padding=0]
 * @param {number}         [innerPadding=0]
 * @return {{ xScale: Function, yScale: Function, bars: Array.<Object> }}
 */
var generateHorizontalGroupedBars = function generateHorizontalGroupedBars(_ref2) {
    var data = _ref2.data,
        getIndex = _ref2.getIndex,
        keys = _ref2.keys,
        minValue = _ref2.minValue,
        maxValue = _ref2.maxValue,
        reverse = _ref2.reverse,
        width = _ref2.width,
        height = _ref2.height,
        getColor = _ref2.getColor,
        _ref2$padding = _ref2.padding,
        padding = _ref2$padding === undefined ? 0 : _ref2$padding,
        _ref2$innerPadding = _ref2.innerPadding,
        innerPadding = _ref2$innerPadding === undefined ? 0 : _ref2$innerPadding;

    var xRange = reverse ? [width, 0] : [0, width];
    var xScale = getGroupedScale(data, keys, minValue, maxValue, xRange);
    var yScale = getIndexedScale(data, getIndex, [height, 0], padding);

    var barHeight = (yScale.bandwidth() - innerPadding * (keys.length - 1)) / keys.length;
    var xRef = xScale(0);

    var getX = function getX(d) {
        return d > 0 ? xRef : xScale(d);
    };
    var getWidth = function getWidth(d, x) {
        return d > 0 ? xScale(d) - xRef : xRef - x;
    };
    if (reverse) {
        getX = function getX(d) {
            return d < 0 ? xRef : xScale(d);
        };
        getWidth = function getWidth(d, x) {
            return d < 0 ? xScale(d) - xRef : xRef - x;
        };
    }

    var bars = [];
    if (barHeight > 0) {
        keys.forEach(function (key, i) {
            range(yScale.domain().length).forEach(function (index) {
                var x = getX(data[index][key]);
                var y = yScale(getIndex(data[index])) + barHeight * i + innerPadding * i;
                var barWidth = getWidth(data[index][key], x);

                if (barWidth > 0) {
                    var barData = {
                        id: key,
                        value: data[index][key],
                        index: index,
                        indexValue: getIndex(data[index]),
                        data: data[index]
                    };

                    bars.push({
                        key: key + '.' + barData.indexValue,
                        data: barData,
                        x: x,
                        y: y,
                        width: barWidth,
                        height: barHeight,
                        color: getColor(barData)
                    });
                }
            });
        });
    }

    return { xScale: xScale, yScale: yScale, bars: bars };
};

/**
 * Generates x/y scales & bars for grouped bar chart.
 *
 * @param {Object} options
 * @return {{ xScale: Function, yScale: Function, bars: Array.<Object> }}
 */
var generateGroupedBars = function generateGroupedBars(options) {
    return options.layout === 'vertical' ? generateVerticalGroupedBars(options) : generateHorizontalGroupedBars(options);
};

/**
 * Generates scale for stacked bar chart.
 *
 * @param {Array.<Object>} data
 * @param {number|string}  _minValue
 * @param {number|string}  _maxValue
 * @param {Array.<number>} range
 * @returns {Function}
 */
var getStackedScale = function getStackedScale(data, _minValue, _maxValue, range$$1) {
    var allValues = flattenDepth(data, 2);

    var minValue = _minValue;
    if (minValue === 'auto') {
        minValue = min(allValues);
    }

    var maxValue = _maxValue;
    if (maxValue === 'auto') {
        maxValue = max(allValues);
    }

    return d3Scale.scaleLinear().rangeRound(range$$1).domain([minValue, maxValue]);
};

/**
 * Generates x/y scales & bars for vertical stacked bar chart.
 *
 * @param {Array.<Object>} data
 * @param {Function}       getIndex
 * @param {Array.<string>} keys
 * @param {number}         minValue
 * @param {number}         maxValue
 * @param {boolean}        reverse
 * @param {number}         width
 * @param {number}         height
 * @param {Function}       getColor
 * @param {number}         [padding=0]
 * @param {number}         [innerPadding=0]
 * @return {{ xScale: Function, yScale: Function, bars: Array.<Object> }}
 */
var generateVerticalStackedBars = function generateVerticalStackedBars(_ref) {
    var data = _ref.data,
        getIndex = _ref.getIndex,
        keys = _ref.keys,
        minValue = _ref.minValue,
        maxValue = _ref.maxValue,
        reverse = _ref.reverse,
        width = _ref.width,
        height = _ref.height,
        getColor = _ref.getColor,
        _ref$padding = _ref.padding,
        padding = _ref$padding === undefined ? 0 : _ref$padding,
        _ref$innerPadding = _ref.innerPadding,
        innerPadding = _ref$innerPadding === undefined ? 0 : _ref$innerPadding;

    var stackedData = d3Shape.stack().keys(keys).offset(d3Shape.stackOffsetDiverging)(data);

    var xScale = getIndexedScale(data, getIndex, [0, width], padding);
    var yRange = reverse ? [0, height] : [height, 0];
    var yScale = getStackedScale(stackedData, minValue, maxValue, yRange);

    var bars = [];
    var barWidth = xScale.bandwidth();

    var getY = function getY(d) {
        return yScale(d[1]);
    };
    var getHeight = function getHeight(d, y) {
        return yScale(d[0]) - y;
    };
    if (reverse) {
        getY = function getY(d) {
            return yScale(d[0]);
        };
        getHeight = function getHeight(d, y) {
            return yScale(d[1]) - y;
        };
    }

    if (barWidth > 0) {
        stackedData.forEach(function (stackedDataItem) {
            xScale.domain().forEach(function (index, i) {
                var d = stackedDataItem[i];
                var x = xScale(getIndex(d.data));

                var y = getY(d);
                var barHeight = getHeight(d, y);
                if (innerPadding > 0) {
                    y += innerPadding * 0.5;
                    barHeight -= innerPadding;
                }

                if (barHeight >= 0) {
                    var barData = {
                        id: stackedDataItem.key,
                        value: d.data[stackedDataItem.key],
                        index: i,
                        indexValue: index,
                        data: d.data
                    };

                    bars.push({
                        key: stackedDataItem.key + '.' + index,
                        data: barData,
                        x: x,
                        y: y,
                        width: barWidth,
                        height: barHeight,
                        color: getColor(barData)
                    });
                }
            });
        });
    }

    return { xScale: xScale, yScale: yScale, bars: bars };
};

/**
 * Generates x/y scales & bars for horizontal stacked bar chart.
 *
 * @param {Array.<Object>} data
 * @param {Function}       getIndex
 * @param {Array.<string>} keys
 * @param {number}         minValue
 * @param {number}         maxValue
 * @param {boolean}        reverse
 * @param {number}         width
 * @param {number}         height
 * @param {Function}       getColor
 * @param {number}         [padding=0]
 * @param {number}         [innerPadding=0]
 * @return {{ xScale: Function, yScale: Function, bars: Array.<Object> }}
 */
var generateHorizontalStackedBars = function generateHorizontalStackedBars(_ref2) {
    var data = _ref2.data,
        getIndex = _ref2.getIndex,
        keys = _ref2.keys,
        minValue = _ref2.minValue,
        maxValue = _ref2.maxValue,
        reverse = _ref2.reverse,
        width = _ref2.width,
        height = _ref2.height,
        getColor = _ref2.getColor,
        _ref2$padding = _ref2.padding,
        padding = _ref2$padding === undefined ? 0 : _ref2$padding,
        _ref2$innerPadding = _ref2.innerPadding,
        innerPadding = _ref2$innerPadding === undefined ? 0 : _ref2$innerPadding;

    var stackedData = d3Shape.stack().keys(keys).offset(d3Shape.stackOffsetDiverging)(data);

    var xRange = reverse ? [width, 0] : [0, width];
    var xScale = getStackedScale(stackedData, minValue, maxValue, xRange);
    var yScale = getIndexedScale(data, getIndex, [height, 0], padding);

    var bars = [];
    var barHeight = yScale.bandwidth();

    var getX = function getX(d) {
        return xScale(d[0]);
    };
    var getWidth = function getWidth(d, x) {
        return xScale(d[1]) - x;
    };
    if (reverse) {
        getX = function getX(d) {
            return xScale(d[1]);
        };
        getWidth = function getWidth(d, y) {
            return xScale(d[0]) - y;
        };
    }

    if (barHeight > 0) {
        stackedData.forEach(function (stackedDataItem) {
            yScale.domain().forEach(function (index, i) {
                var d = stackedDataItem[i];
                var y = yScale(getIndex(d.data));

                var barData = {
                    id: stackedDataItem.key,
                    value: d.data[stackedDataItem.key],
                    index: i,
                    indexValue: index,
                    data: d.data
                };

                var x = getX(d);
                var barWidth = getWidth(d, x);
                if (innerPadding > 0) {
                    x += innerPadding * 0.5;
                    barWidth -= innerPadding;
                }

                if (barWidth >= 0) {
                    bars.push({
                        key: stackedDataItem.key + '.' + index,
                        data: barData,
                        x: x,
                        y: y,
                        width: barWidth,
                        height: barHeight,
                        color: getColor(barData)
                    });
                }
            });
        });
    }

    return { xScale: xScale, yScale: yScale, bars: bars };
};

/**
 * Generates x/y scales & bars for stacked bar chart.
 *
 * @param {Object} options
 * @return {{ xScale: Function, yScale: Function, bars: Array.<Object> }}
 */
var generateStackedBars = function generateStackedBars(options) {
    return options.layout === 'vertical' ? generateVerticalStackedBars(options) : generateHorizontalStackedBars(options);
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var BarItem = function BarItem(_ref) {
    var data = _ref.data,
        x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height,
        borderRadius = _ref.borderRadius,
        color = _ref.color,
        borderWidth = _ref.borderWidth,
        borderColor = _ref.borderColor,
        label = _ref.label,
        shouldRenderLabel = _ref.shouldRenderLabel,
        labelColor = _ref.labelColor,
        showTooltip = _ref.showTooltip,
        hideTooltip = _ref.hideTooltip,
        onClick = _ref.onClick,
        onMouseEnter = _ref.onMouseEnter,
        onMouseLeave = _ref.onMouseLeave,
        tooltip = _ref.tooltip,
        theme = _ref.theme;

    var handleTooltip = function handleTooltip(e) {
        return showTooltip(tooltip, e);
    };
    var handleMouseEnter = function handleMouseEnter(e) {
        onMouseEnter(data, e);
        showTooltip(tooltip, e);
    };
    var handleMouseLeave = function handleMouseLeave(e) {
        onMouseLeave(data, e);
        hideTooltip(e);
    };

    return React__default.createElement(
        'g',
        { transform: 'translate(' + x + ', ' + y + ')' },
        React__default.createElement('rect', {
            width: width,
            height: height,
            rx: borderRadius,
            ry: borderRadius,
            fill: data.fill ? data.fill : color,
            strokeWidth: borderWidth,
            stroke: borderColor,
            onMouseEnter: handleMouseEnter,
            onMouseMove: handleTooltip,
            onMouseLeave: handleMouseLeave,
            onClick: onClick
        }),
        shouldRenderLabel && React__default.createElement(
            'text',
            {
                x: width / 2,
                y: height / 2,
                textAnchor: 'middle',
                alignmentBaseline: 'central',
                style: _extends({}, theme.labels.text, {
                    pointerEvents: 'none',
                    fill: labelColor
                })
            },
            label
        )
    );
};

BarItem.propTypes = {
    data: PropTypes.shape({
        id: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        indexValue: PropTypes.string.isRequired
    }).isRequired,

    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    borderRadius: PropTypes.number.isRequired,
    borderWidth: PropTypes.number.isRequired,
    borderColor: PropTypes.string.isRequired,

    label: PropTypes.node.isRequired,
    shouldRenderLabel: PropTypes.bool.isRequired,
    labelColor: PropTypes.string.isRequired,

    showTooltip: PropTypes.func.isRequired,
    hideTooltip: PropTypes.func.isRequired,
    getTooltipLabel: PropTypes.func.isRequired,
    tooltipFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    tooltip: PropTypes.element.isRequired,

    theme: PropTypes.shape({
        tooltip: PropTypes.shape({}).isRequired
    }).isRequired
};

var enhance = compose(withPropsOnChange(['data', 'color', 'onClick'], function (_ref2) {
    var data = _ref2.data,
        color = _ref2.color,
        _onClick = _ref2.onClick;
    return {
        onClick: function onClick(event) {
            return _onClick(_extends({ color: color }, data), event);
        }
    };
}), withPropsOnChange(['data', 'color', 'theme', 'tooltip', 'getTooltipLabel', 'tooltipFormat'], function (_ref3) {
    var data = _ref3.data,
        color = _ref3.color,
        theme = _ref3.theme,
        tooltip = _ref3.tooltip,
        getTooltipLabel = _ref3.getTooltipLabel,
        tooltipFormat = _ref3.tooltipFormat;
    return {
        tooltip: React__default.createElement(core.BasicTooltip, {
            id: getTooltipLabel(data),
            value: data.value,
            enableChip: true,
            color: color,
            theme: theme,
            format: tooltipFormat,
            renderContent: typeof tooltip === 'function' ? tooltip.bind(null, _extends({ color: color, theme: theme }, data)) : null
        })
    };
}), pure);

var BarItem$1 = enhance(BarItem);

var BarPropTypes = _extends({
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    indexBy: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    getIndex: PropTypes.func.isRequired, // computed
    keys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
    layers: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.oneOf(['grid', 'axes', 'bars', 'markers', 'legends']), PropTypes.func])).isRequired,

    groupMode: PropTypes.oneOf(['stacked', 'grouped']).isRequired,
    layout: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
    reverse: PropTypes.bool.isRequired,

    minValue: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]).isRequired,
    maxValue: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]).isRequired,
    padding: PropTypes.number.isRequired,
    innerPadding: PropTypes.number.isRequired,

    axisTop: axes.axisPropType,
    axisRight: axes.axisPropType,
    axisBottom: axes.axisPropType,
    axisLeft: axes.axisPropType,
    enableGridX: PropTypes.bool.isRequired,
    enableGridY: PropTypes.bool.isRequired,
    gridXValues: PropTypes.arrayOf(PropTypes.number),
    gridYValues: PropTypes.arrayOf(PropTypes.number),

    barComponent: PropTypes.func.isRequired,

    enableLabel: PropTypes.bool.isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    labelFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    getLabel: PropTypes.func.isRequired, // computed
    labelSkipWidth: PropTypes.number.isRequired,
    labelSkipHeight: PropTypes.number.isRequired,
    labelTextColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    getLabelTextColor: PropTypes.func.isRequired, // computed
    labelLinkColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    getLabelLinkColor: PropTypes.func.isRequired, // computed

    borderRadius: PropTypes.number.isRequired,
    getColor: PropTypes.func.isRequired }, core.defsPropTypes, {
    borderWidth: PropTypes.number.isRequired,
    borderColor: PropTypes.any.isRequired,
    getBorderColor: PropTypes.func.isRequired,

    isInteractive: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    tooltipLabel: PropTypes.func,
    getTooltipLabel: PropTypes.func.isRequired,
    tooltipFormat: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    tooltip: PropTypes.func,

    legends: PropTypes.arrayOf(PropTypes.shape(_extends({
        dataFrom: PropTypes.oneOf(['indexes', 'keys']).isRequired
    }, legends.LegendPropShape))).isRequired,

    // canvas specific
    pixelRatio: PropTypes.number.isRequired
});

var BarDefaultProps = {
    indexBy: 'id',
    keys: ['value'],
    layers: ['grid', 'axes', 'bars', 'markers', 'legends'],

    groupMode: 'stacked',
    layout: 'vertical',
    reverse: false,

    minValue: 'auto',
    maxValue: 'auto',
    padding: 0.1,
    innerPadding: 0,

    axisBottom: {},
    axisLeft: {},
    enableGridX: false,
    enableGridY: true,

    barComponent: BarItem$1,

    enableLabel: true,
    label: 'value',
    labelSkipWidth: 0,
    labelSkipHeight: 0,
    labelLinkColor: 'theme',
    labelTextColor: 'theme',

    defs: [],
    fill: [],
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'inherit',

    isInteractive: true,
    onClick: core.noop,
    onMouseEnter: core.noop,
    onMouseLeave: core.noop,

    legends: [],

    // canvas specific
    pixelRatio: global.window && global.window.devicePixelRatio ? global.window.devicePixelRatio : 1
};

var enhance$1 = (function (Component) {
    return compose(defaultProps(BarDefaultProps), core.withTheme(), core.withColors(), core.withDimensions(), core.withMotion(), withPropsOnChange(['indexBy'], function (_ref) {
        var indexBy = _ref.indexBy;
        return {
            getIndex: core.getAccessorFor(indexBy)
        };
    }), withPropsOnChange(['labelTextColor'], function (_ref2) {
        var labelTextColor = _ref2.labelTextColor;
        return {
            getLabelTextColor: core.getInheritedColorGenerator(labelTextColor, 'axis.ticks.text.fill')
        };
    }), withPropsOnChange(['labelLinkColor'], function (_ref3) {
        var labelLinkColor = _ref3.labelLinkColor;
        return {
            getLabelLinkColor: core.getInheritedColorGenerator(labelLinkColor, 'axis.ticks.line.stroke')
        };
    }), withPropsOnChange(['label', 'labelFormat'], function (_ref4) {
        var label = _ref4.label,
            labelFormat = _ref4.labelFormat;
        return {
            getLabel: core.getLabelGenerator(label, labelFormat)
        };
    }), withPropsOnChange(['borderColor'], function (_ref5) {
        var borderColor = _ref5.borderColor;
        return {
            getBorderColor: core.getInheritedColorGenerator(borderColor)
        };
    }), withPropsOnChange(['tooltipLabel'], function (_ref6) {
        var tooltipLabel = _ref6.tooltipLabel;

        var getTooltipLabel = function getTooltipLabel(d) {
            return d.id + ' - ' + d.indexValue;
        };
        if (typeof tooltipLabel === 'function') {
            getTooltipLabel = tooltipLabel;
        }

        return { getTooltipLabel: getTooltipLabel };
    }), pure)(Component);
});

var barWillEnterHorizontal = function barWillEnterHorizontal(_ref) {
    var style = _ref.style;
    return {
        x: style.x.val,
        y: style.y.val,
        width: 0,
        height: style.height.val
    };
};

var barWillEnterVertical = function barWillEnterVertical(_ref2) {
    var style = _ref2.style;
    return {
        x: style.x.val,
        y: style.y.val + style.height.val,
        width: style.width.val,
        height: 0
    };
};

var barWillLeaveHorizontal = function barWillLeaveHorizontal(springConfig) {
    return function (_ref3) {
        var style = _ref3.style;
        return {
            x: style.x,
            y: style.y,
            width: reactMotion.spring(0, springConfig),
            height: style.height
        };
    };
};

var barWillLeaveVertical = function barWillLeaveVertical(springConfig) {
    return function (_ref4) {
        var style = _ref4.style;
        return {
            x: style.x,
            y: reactMotion.spring(style.y.val + style.height.val, springConfig),
            width: style.width,
            height: reactMotion.spring(0, springConfig)
        };
    };
};

var Bar = function Bar(props) {
    var data = props.data,
        getIndex = props.getIndex,
        keys = props.keys,
        groupMode = props.groupMode,
        layout = props.layout,
        reverse = props.reverse,
        minValue = props.minValue,
        maxValue = props.maxValue,
        margin = props.margin,
        width = props.width,
        height = props.height,
        outerWidth = props.outerWidth,
        outerHeight = props.outerHeight,
        padding = props.padding,
        innerPadding = props.innerPadding,
        axisTop = props.axisTop,
        axisRight = props.axisRight,
        axisBottom = props.axisBottom,
        axisLeft = props.axisLeft,
        enableGridX = props.enableGridX,
        enableGridY = props.enableGridY,
        gridXValues = props.gridXValues,
        gridYValues = props.gridYValues,
        layers = props.layers,
        barComponent = props.barComponent,
        enableLabel = props.enableLabel,
        getLabel = props.getLabel,
        labelSkipWidth = props.labelSkipWidth,
        labelSkipHeight = props.labelSkipHeight,
        getLabelTextColor = props.getLabelTextColor,
        markers = props.markers,
        theme = props.theme,
        getColor = props.getColor,
        defs = props.defs,
        fill = props.fill,
        borderRadius = props.borderRadius,
        borderWidth = props.borderWidth,
        getBorderColor = props.getBorderColor,
        animate = props.animate,
        motionStiffness = props.motionStiffness,
        motionDamping = props.motionDamping,
        isInteractive = props.isInteractive,
        getTooltipLabel = props.getTooltipLabel,
        tooltipFormat = props.tooltipFormat,
        tooltip = props.tooltip,
        onClick = props.onClick,
        onMouseEnter = props.onMouseEnter,
        onMouseLeave = props.onMouseLeave,
        legends$$1 = props.legends;

    var options = {
        layout: layout,
        reverse: reverse,
        data: data,
        getIndex: getIndex,
        keys: keys,
        minValue: minValue,
        maxValue: maxValue,
        width: width,
        height: height,
        getColor: getColor,
        padding: padding,
        innerPadding: innerPadding
    };
    var result = groupMode === 'grouped' ? generateGroupedBars(options) : generateStackedBars(options);

    var motionProps = {
        animate: animate,
        motionDamping: motionDamping,
        motionStiffness: motionStiffness
    };

    var springConfig = {
        damping: motionDamping,
        stiffness: motionStiffness
    };

    var willEnter = layout === 'vertical' ? barWillEnterVertical : barWillEnterHorizontal;
    var willLeave = layout === 'vertical' ? barWillLeaveVertical(springConfig) : barWillLeaveHorizontal(springConfig);

    var shouldRenderLabel = function shouldRenderLabel(_ref5) {
        var width = _ref5.width,
            height = _ref5.height;

        if (!enableLabel) return false;
        if (labelSkipWidth > 0 && width < labelSkipWidth) return false;
        if (labelSkipHeight > 0 && height < labelSkipHeight) return false;
        return true;
    };

    var boundDefs = core.bindDefs(defs, result.bars, fill, {
        dataKey: 'data',
        targetKey: 'data.fill'
    });

    var legendDataForKeys = uniqBy(result.bars.map(function (bar) {
        return {
            id: bar.data.id,
            label: bar.data.id,
            color: bar.color,
            fill: bar.data.fill
        };
    }).reverse(), function (_ref6) {
        var id = _ref6.id;
        return id;
    });

    var legendDataForIndexes = uniqBy(result.bars.map(function (bar) {
        return {
            id: bar.data.indexValue,
            label: bar.data.indexValue,
            color: bar.color,
            fill: bar.data.fill
        };
    }), function (_ref7) {
        var id = _ref7.id;
        return id;
    });

    return React__default.createElement(
        core.Container,
        { isInteractive: isInteractive, theme: theme },
        function (_ref8) {
            var showTooltip = _ref8.showTooltip,
                hideTooltip = _ref8.hideTooltip;

            var commonProps = {
                borderRadius: borderRadius,
                borderWidth: borderWidth,
                enableLabel: enableLabel,
                labelSkipWidth: labelSkipWidth,
                labelSkipHeight: labelSkipHeight,
                showTooltip: showTooltip,
                hideTooltip: hideTooltip,
                onClick: onClick,
                onMouseEnter: onMouseEnter,
                onMouseLeave: onMouseLeave,
                theme: theme,
                getTooltipLabel: getTooltipLabel,
                tooltipFormat: tooltipFormat,
                tooltip: tooltip
            };

            var bars = void 0;
            if (animate === true) {
                bars = React__default.createElement(
                    reactMotion.TransitionMotion,
                    {
                        key: 'bars',
                        willEnter: willEnter,
                        willLeave: willLeave,
                        styles: result.bars.map(function (bar) {
                            return {
                                key: bar.key,
                                data: bar,
                                style: {
                                    x: reactMotion.spring(bar.x, springConfig),
                                    y: reactMotion.spring(bar.y, springConfig),
                                    width: reactMotion.spring(bar.width, springConfig),
                                    height: reactMotion.spring(bar.height, springConfig)
                                }
                            };
                        })
                    },
                    function (interpolatedStyles) {
                        return React__default.createElement(
                            'g',
                            null,
                            interpolatedStyles.map(function (_ref9) {
                                var key = _ref9.key,
                                    style = _ref9.style,
                                    bar = _ref9.data;

                                var baseProps = _extends({}, bar, style);

                                return React__default.createElement(barComponent, _extends({
                                    key: key
                                }, baseProps, commonProps, {
                                    shouldRenderLabel: shouldRenderLabel(baseProps),
                                    width: Math.max(style.width, 0),
                                    height: Math.max(style.height, 0),
                                    label: getLabel(bar.data),
                                    labelColor: getLabelTextColor(baseProps, theme),
                                    borderColor: getBorderColor(baseProps),
                                    theme: theme
                                }));
                            })
                        );
                    }
                );
            } else {
                bars = result.bars.map(function (d) {
                    return React__default.createElement(barComponent, _extends({
                        key: d.key
                    }, d, commonProps, {
                        label: getLabel(d.data),
                        shouldRenderLabel: shouldRenderLabel(d),
                        labelColor: getLabelTextColor(d, theme),
                        borderColor: getBorderColor(d),
                        theme: theme
                    }));
                });
            }

            var layerById = {
                grid: React__default.createElement(core.Grid, _extends({
                    key: 'grid',
                    theme: theme,
                    width: width,
                    height: height,
                    xScale: enableGridX ? result.xScale : null,
                    yScale: enableGridY ? result.yScale : null,
                    xValues: gridXValues,
                    yValues: gridYValues
                }, motionProps)),
                axes: React__default.createElement(axes.Axes, _extends({
                    key: 'axes',
                    xScale: result.xScale,
                    yScale: result.yScale,
                    width: width,
                    height: height,
                    theme: theme,
                    top: axisTop,
                    right: axisRight,
                    bottom: axisBottom,
                    left: axisLeft
                }, motionProps)),
                bars: bars,
                markers: React__default.createElement(core.CartesianMarkers, {
                    key: 'markers',
                    markers: markers,
                    width: width,
                    height: height,
                    xScale: result.xScale,
                    yScale: result.yScale,
                    theme: theme
                }),
                legends: legends$$1.map(function (legend, i) {
                    var legendData = void 0;
                    if (legend.dataFrom === 'keys') {
                        legendData = legendDataForKeys;
                    } else if (legend.dataFrom === 'indexes') {
                        legendData = legendDataForIndexes;
                    }

                    if (legendData === undefined) return null;

                    return React__default.createElement(legends.BoxLegendSvg, _extends({
                        key: i
                    }, legend, {
                        containerWidth: width,
                        containerHeight: height,
                        data: legendData,
                        theme: theme
                    }));
                })
            };

            return React__default.createElement(
                core.SvgWrapper,
                {
                    width: outerWidth,
                    height: outerHeight,
                    margin: margin,
                    defs: boundDefs,
                    theme: theme
                },
                layers.map(function (layer, i) {
                    if (typeof layer === 'function') {
                        return React__default.createElement(
                            React.Fragment,
                            { key: i },
                            layer(_extends({}, props, result))
                        );
                    }
                    return layerById[layer];
                })
            );
        }
    );
};

Bar.propTypes = BarPropTypes;

var Bar$1 = setDisplayName('Bar')(enhance$1(Bar));

var findNodeUnderCursor = function findNodeUnderCursor(nodes, margin, x, y) {
    return nodes.find(function (node) {
        return core.isCursorInRect(node.x + margin.left, node.y + margin.top, node.width, node.height, x, y);
    });
};

var BarCanvas = function (_Component) {
    inherits(BarCanvas, _Component);

    function BarCanvas() {
        var _temp, _this, _ret;

        classCallCheck(this, BarCanvas);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.handleMouseHover = function (showTooltip, hideTooltip) {
            return function (event) {
                if (!_this.bars) return;

                var _this$props = _this.props,
                    margin = _this$props.margin,
                    theme = _this$props.theme,
                    tooltip = _this$props.tooltip,
                    getTooltipLabel = _this$props.getTooltipLabel,
                    tooltipFormat = _this$props.tooltipFormat;

                var _getRelativeCursor = core.getRelativeCursor(_this.surface, event),
                    x = _getRelativeCursor[0],
                    y = _getRelativeCursor[1];

                var bar = findNodeUnderCursor(_this.bars, margin, x, y);

                if (bar !== undefined) {
                    showTooltip(React__default.createElement(core.BasicTooltip, {
                        id: getTooltipLabel(bar.data),
                        value: bar.data.value,
                        enableChip: true,
                        color: bar.color,
                        theme: theme,
                        format: tooltipFormat,
                        renderContent: typeof tooltip === 'function' ? tooltip.bind(null, _extends({ color: bar.color }, bar.data)) : null
                    }), event);
                } else {
                    hideTooltip();
                }
            };
        }, _this.handleMouseLeave = function (hideTooltip) {
            return function () {
                hideTooltip();
            };
        }, _this.handleClick = function (event) {
            if (!_this.bars) return;

            var _this$props2 = _this.props,
                margin = _this$props2.margin,
                onClick = _this$props2.onClick;

            var _getRelativeCursor2 = core.getRelativeCursor(_this.surface, event),
                x = _getRelativeCursor2[0],
                y = _getRelativeCursor2[1];

            var node = findNodeUnderCursor(_this.bars, margin, x, y);
            if (node !== undefined) onClick(node.data, event);
        }, _temp), possibleConstructorReturn(_this, _ret);
    }

    BarCanvas.prototype.componentDidMount = function componentDidMount() {
        this.ctx = this.surface.getContext('2d');
        this.draw(this.props);
    };

    BarCanvas.prototype.shouldComponentUpdate = function shouldComponentUpdate(props) {
        if (this.props.outerWidth !== props.outerWidth || this.props.outerHeight !== props.outerHeight || this.props.isInteractive !== props.isInteractive || this.props.theme !== props.theme) {
            return true;
        } else {
            this.draw(props);
            return false;
        }
    };

    BarCanvas.prototype.componentDidUpdate = function componentDidUpdate() {
        this.ctx = this.surface.getContext('2d');
        this.draw(this.props);
    };

    BarCanvas.prototype.draw = function draw(props) {
        var _this2 = this;

        var data = props.data,
            keys = props.keys,
            getIndex = props.getIndex,
            minValue = props.minValue,
            maxValue = props.maxValue,
            width = props.width,
            height = props.height,
            outerWidth = props.outerWidth,
            outerHeight = props.outerHeight,
            pixelRatio = props.pixelRatio,
            margin = props.margin,
            layout = props.layout,
            reverse = props.reverse,
            groupMode = props.groupMode,
            padding = props.padding,
            innerPadding = props.innerPadding,
            axisTop = props.axisTop,
            axisRight = props.axisRight,
            axisBottom = props.axisBottom,
            axisLeft = props.axisLeft,
            theme = props.theme,
            getColor = props.getColor,
            legends$$1 = props.legends,
            enableGridX = props.enableGridX,
            enableGridY = props.enableGridY;


        this.surface.width = outerWidth * pixelRatio;
        this.surface.height = outerHeight * pixelRatio;

        this.ctx.scale(pixelRatio, pixelRatio);

        var options = {
            layout: layout,
            reverse: reverse,
            data: data,
            getIndex: getIndex,
            keys: keys,
            minValue: minValue,
            maxValue: maxValue,
            width: width,
            height: height,
            getColor: getColor,
            padding: padding,
            innerPadding: innerPadding
        };

        var result = groupMode === 'grouped' ? generateGroupedBars(options) : generateStackedBars(options);

        this.bars = result.bars;

        this.ctx.fillStyle = theme.background;
        this.ctx.fillRect(0, 0, outerWidth, outerHeight);
        this.ctx.translate(margin.left, margin.top);

        this.ctx.strokeStyle = '#dddddd';
        enableGridX && core.renderGridLinesToCanvas(this.ctx, {
            width: width,
            height: height,
            scale: result.xScale,
            axis: 'x'
        });
        enableGridY && core.renderGridLinesToCanvas(this.ctx, {
            width: width,
            height: height,
            scale: result.yScale,
            axis: 'y'
        });

        this.ctx.strokeStyle = '#dddddd';

        var legendDataForKeys = uniqBy(result.bars.map(function (bar) {
            return {
                id: bar.data.id,
                label: bar.data.id,
                color: bar.color,
                fill: bar.data.fill
            };
        }).reverse(), function (_ref) {
            var id = _ref.id;
            return id;
        });
        var legendDataForIndexes = uniqBy(result.bars.map(function (bar) {
            return {
                id: bar.data.indexValue,
                label: bar.data.indexValue,
                color: bar.color,
                fill: bar.data.fill
            };
        }), function (_ref2) {
            var id = _ref2.id;
            return id;
        });

        legends$$1.forEach(function (legend) {
            var legendData = void 0;
            if (legend.dataFrom === 'keys') {
                legendData = legendDataForKeys;
            } else if (legend.dataFrom === 'indexes') {
                legendData = legendDataForIndexes;
            }

            if (legendData === undefined) return null;
            legends.renderLegendToCanvas(_this2.ctx, _extends({}, legend, {
                data: legendData,
                containerWidth: width,
                containerHeight: height,
                itemTextColor: '#999',
                symbolSize: 16
            }));
        });

        axes.renderAxesToCanvas(this.ctx, {
            xScale: result.xScale,
            yScale: result.yScale,
            width: width,
            height: height,
            top: axisTop,
            right: axisRight,
            bottom: axisBottom,
            left: axisLeft,
            theme: theme
        });

        result.bars.forEach(function (_ref3) {
            var x = _ref3.x,
                y = _ref3.y,
                color = _ref3.color,
                width = _ref3.width,
                height = _ref3.height;

            _this2.ctx.fillStyle = color;
            _this2.ctx.fillRect(x, y, width, height);
        });
    };

    BarCanvas.prototype.render = function render() {
        var _this3 = this;

        var _props = this.props,
            outerWidth = _props.outerWidth,
            outerHeight = _props.outerHeight,
            pixelRatio = _props.pixelRatio,
            isInteractive = _props.isInteractive,
            theme = _props.theme;


        return React__default.createElement(
            core.Container,
            { isInteractive: isInteractive, theme: theme },
            function (_ref4) {
                var showTooltip = _ref4.showTooltip,
                    hideTooltip = _ref4.hideTooltip;
                return React__default.createElement('canvas', {
                    ref: function ref(surface) {
                        _this3.surface = surface;
                    },
                    width: outerWidth * pixelRatio,
                    height: outerHeight * pixelRatio,
                    style: {
                        width: outerWidth,
                        height: outerHeight
                    },
                    onMouseEnter: _this3.handleMouseHover(showTooltip, hideTooltip),
                    onMouseMove: _this3.handleMouseHover(showTooltip, hideTooltip),
                    onMouseLeave: _this3.handleMouseLeave(hideTooltip),
                    onClick: _this3.handleClick
                });
            }
        );
    };

    return BarCanvas;
}(React.Component);

BarCanvas.propTypes = BarPropTypes;

var BarCanvas$1 = setDisplayName('BarCanvas')(enhance$1(BarCanvas));

var ResponsiveBar = function ResponsiveBar(props) {
    return React__default.createElement(
        core.ResponsiveWrapper,
        null,
        function (_ref) {
            var width = _ref.width,
                height = _ref.height;
            return React__default.createElement(Bar$1, _extends({ width: width, height: height }, props));
        }
    );
};

var ResponsiveBarCanvas = function ResponsiveBarCanvas(props) {
    return React__default.createElement(
        core.ResponsiveWrapper,
        null,
        function (_ref) {
            var width = _ref.width,
                height = _ref.height;
            return React__default.createElement(BarCanvas$1, _extends({ width: width, height: height }, props));
        }
    );
};

exports.Bar = Bar$1;
exports.BarCanvas = BarCanvas$1;
exports.ResponsiveBar = ResponsiveBar;
exports.ResponsiveBarCanvas = ResponsiveBarCanvas;
exports.BarPropTypes = BarPropTypes;
exports.BarDefaultProps = BarDefaultProps;
