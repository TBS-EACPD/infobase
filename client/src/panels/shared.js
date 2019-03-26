import './shared.scss';
import * as general_utils from '../general_utils.js';
import * as util_components from '../util_components.js';
import * as declarative_charts from '../charts/declarative_charts.js';
import * as charts_index from '../core/charts_index';
import * as Results from '../models/results.js';
import { create_text_maker, trivial_text_maker, run_template } from '../models/text.js';
import { formats, dollar_formats } from '../core/format.js';
import { PanelGraph, layout_types } from '../core/PanelGraph.js';
import { infobaseCategory10Colors } from '../core/color_schemes.js';
import { Panel, StdPanel, TextPanel, Col } from '../components/panel-components.js';
import { reactAdapter } from '../core/reactAdapter';
import { Table } from '../core/TableClass.js';
import { rpb_link, get_appropriate_rpb_subject } from '../rpb/rpb_link.js';
import { Subject } from '../models/subject';
import { years } from '../models/years.js';
import { businessConstants } from '../models/businessConstants.js';
import FootNote from '../models/footnotes'; 
import { infograph_href_template as infograph_href_template } from '../infographic/routes.js';
import { glossary_href } from '../link_utils.js';
import { Statistics } from '../core/Statistics.js';
import classNames from 'classnames';
import { get_source_links } from '../metadata/data_sources.js';
import { NivoResponsiveBar, NivoResponsiveLine, NivoResponsivePie } from '../charts/NivoCharts.js';

const {
  SafePie,
  TabularPercentLegend,
  GraphLegend,
  Bar,
  Line,
} = declarative_charts;

const {
  Format,
  HeightClipper,
  TabbedControls,
  TabbedContent,
  TM, 
  create_text_maker_component,
  DlItem,
} = util_components;

export const PplSharePie = ({graph_args, label_col_header, sort_func}) => {
  sort_func = sort_func || ((a,b) => b.value-a.value);

  const data = graph_args
    .map( d => 
      ({
        value: d.five_year_percent, 
        label: d.label,
      })
    ).sort(function (a, b) {
      return sort_func(a,b);
    });

  const color_scale = infobase_colors();

  const legend_items = _.map(data, ({value, label }) => ({
    value,
    label,
    color: color_scale(label),
    id: label,
  }));

  return <div aria-hidden={true}
    className="ppl-share-pie-area"
  >
    <div className="ppl-share-pie-graph">
      <SafePie 
        label_attr={false}
        showLabels={false}
        color={color_scale}
        pct_formatter={formats.percentage1}
        data={data}
        inner_radius={true}
        inner_text={true}
        inner_text_fmt={formats.compact1_raw}
        inner_text_content={label_col_header}
      />
    </div>
    <div className="ppl-share-pie-legend">
      <div className="centerer">
        <div className="centerer-IE-fix">
          <span className="ppl-share-percent-header">
            {trivial_text_maker("five_year_percent_header")}
          </span>
          <TabularPercentLegend
            items={legend_items}
            get_right_content={item => 
              <span>
                <Format type="percentage1" content={item.value} />
              </span>
            }
          />
        </div>
      </div>
    </div>
  </div>;
};


export class LineBarToggleGraph extends React.Component {
  constructor(props){
    super(props);

    this.extra_options_by_graph_mode = {
      bar_stacked: {
        bar: true,
        stacked: true,
      },
      bar_normalized: {
        bar: true,
        stacked: true,
        normalized: true,
        y_axis: "%",
        formatter: formats.percentage_raw,
      },
      bar_grouped: {
        bar: true,
        stacked: false,
      },
      line: {
        bar: false,
        stacked: false,
      },
      line_stacked: {
        bar: false,
        stacked: true,
      },
    };
    this.graph_modes = _.keys(this.extra_options_by_graph_mode);

    const colors = props.colors || props.get_colors();

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

      graph_options,
    } = this.props;

    const {
      colors,
      selected,
      graph_mode,
    } = this.state;

    const extra_graph_options = this.extra_options_by_graph_mode[graph_mode];

    const series = _.chain(data)
      .filter( ({label}) => _.includes(selected, label) )
      .map( ({label, data }) => [ label, data ])
      .fromPairs()
      .value();

    const extended_graph_options = {
      ...graph_options,
      colors,
      series,
      ...extra_graph_options,
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
              onClick={label => {
                this.setState({
                  selected: _.toggle_list(selected, label),
                });
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
          { extra_graph_options.bar && <Bar {...extended_graph_options}/> }
          { !extra_graph_options.bar && <Line {...extended_graph_options}/> }
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
  get_colors: () => infobase_colors(),
  initial_graph_mode: "bar_stacked",
};

export const HeightClippedGraph = ({children}) => (
  <HeightClipper clipHeight={185} allowReclip={true} buttonTextKey={"show_content"} gradientClasses={"gradient gradient-strong"}>
    {children}
  </HeightClipper>
);

export const collapse_by_so = function(programs,table,filter){
  // common calculation for organizing program/so row data by so
  // and summing up all the programs for the last year of spending 
  // then sorting by largest to smallest
  
  return _.chain(programs)
    .map(prog => table.programs.get(prog))
    .compact()
    .flatten()
    .compact()
    .groupBy("so")
    .toPairs()
    .map(key_value => ({
      label: key_value[0], 
      so_num: key_value[1][0].so_num,
      value: d3.sum(key_value[1], d => d["{{pa_last_year}}"]),
    }))
    .filter(filter || (() => true))
    .sortBy(d => -d.value)
    .value();
};

export const sum_a_tag_col = function sum_tag_col(tag, table, col){
  return _.chain(tag.programs)
    .map(p => table.programs.get(p))
    .flatten()
    .compact()
    .filter(col)
    .map(col)
    .reduce( ( (acc, amt) => acc + amt), 0 )
    .value();
};

export const common_react_donut = function render(panel, calculations, options){
  const { graph_args } = calculations;
  
  const node = panel.areas().graph.node();

  const color_scale = infobase_colors();

  const total = d3.sum( graph_args, _.property('value') );

  const has_neg = _.chain(graph_args)
    .map('value')
    .min()
    .value() < 0;

  const legend_items = !has_neg && _.chain(graph_args)
    .sortBy('value')
    .reverse()
    .map( ({value, label }) => ({
      value,
      label,
      color: color_scale(label),
      id: label,
    }))
    .value();

  reactAdapter.render(
    <div aria-hidden={true}>
      <SafePie 
        label_attr={false}
        showLabels={false}
        color={color_scale}
        pct_formatter={formats.percentage1}
        data={graph_args}
        inner_radius={true}
        inner_text={true}
        inner_text_fmt={formats.compact1_raw}
        height={this.height || null}
      />
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
              get_right_content={item => 
                <div style={{width: "120px", display: "flex"}}>
                  <div style={{width: "60px"}}>
                    <Format type="compact1" content={item.value} />
                  </div>
                  <div style={{width: "60px"}}>
                    (<Format type="percentage1" content={(item.value)*Math.pow(total,-1)} />)
                  </div>
                </div>
              }
            />
          </div>
        </div>
      }
    </div>,
    node
  );

};

export const CommonDonut = function({data, height}){

  const color_scale = infobase_colors();

  const total = d3.sum( data, _.property('value') );

  const has_neg = _.chain(data)
    .map('value')
    .min()
    .value() < 0;

  const legend_items = !has_neg && _.chain(data)
    .sortBy('value')
    .reverse()
    .map( ({value, label }) => ({
      value,
      label,
      color: color_scale(label),
      id: label,
    }))
    .value();

  return (
    <div aria-hidden={true}>
      <SafePie 
        label_attr={false}
        showLabels={false}
        color={color_scale}
        pct_formatter={formats.percentage1}
        data={data}
        inner_radius={true}
        inner_text={true}
        inner_text_fmt={formats.compact1_raw}
        height={height || null}
      />
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
              get_right_content={item => 
                <div style={{width: "120px", display: "flex"}}>
                  <div style={{width: "60px"}}>
                    <Format type="compact1" content={item.value} />
                  </div>
                  <div style={{width: "60px"}}>
                    (<Format type="percentage1" content={(item.value)*Math.pow(total,-1)} />)
                  </div>
                </div>
              }
            />
          </div>
        </div>
      }
    </div>
  );
};

export const PlannedActualTable = ({
  planned_ftes,
  actual_ftes,
  diff_ftes,

  planned_spend,
  actual_spend,
  diff_spend,
}) => (
  <table className="table">
    <thead><tr>
      <th></th>
      <th scope="col"> <TM k="planned" /></th>
      <th scope="col"> <TM k="actual" /></th>
      <th scope="col"> <TM k="difference_planned_actual" /></th>
    </tr></thead>
    <tbody>
      <tr>
        <th scope="row"> <TM k="spending"/> </th>
        <td> <Format type="compact1" content={planned_spend} /> </td>
        <td> <Format type="compact1" content={actual_spend} /> </td>
        <td> <Format type="compact1" content={diff_spend} /> </td>
      </tr>
      <tr>
        <th scope="row"> <TM k="ftes"/> </th>
        <td> <Format type="big_int_real" content={planned_ftes} /> </td>
        <td> <Format type="big_int_real" content={actual_ftes} /> </td>
        <td> <Format type="big_int_real" content={diff_ftes} /> </td>
      </tr>
    </tbody> 
  </table>
);

export const get_planned_spending_source_link = subject => {
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

export const get_planned_fte_source_link = subject => {
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

export {
  charts_index, 
  Table, 
  rpb_link,
  get_appropriate_rpb_subject,
  Subject, 
  years, 
  businessConstants, 
  general_utils, 
  FootNote, 
  reactAdapter, 
  util_components, 
  infograph_href_template,
  glossary_href,
  Results,
  Statistics,
  declarative_charts, 
  formats,
  dollar_formats,
  trivial_text_maker, 
  create_text_maker, 
  run_template, 
  PanelGraph, 
  StdPanel, 
  TextPanel, 
  Panel, 
  Col, 
  layout_types, 
  TabbedControls,
  TabbedContent,
  TM,
  create_text_maker_component,
  DlItem,
  get_source_links,
  infobaseCategory10Colors,
  NivoResponsiveBar,
  NivoResponsiveLine,
  NivoResponsivePie,
};