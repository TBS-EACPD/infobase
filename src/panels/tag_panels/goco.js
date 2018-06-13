import text from "./goco.yaml";

import {
  create_text_maker,
  TM as StdTM,
  PanelGraph,
  Subject,
  reactAdapter,  
  formats,
  declarative_charts,
  util_components,
  charts_index,
  Panel,
  Table,
} from '../shared.js';

const { GraphLegend } = declarative_charts;
const { Format } = util_components;
const { Tag } = Subject;

const text_maker = create_text_maker(text);
const TM = props => <StdTM tmf={text_maker} {...props} />;

const state = {active_spend_area : null};
const title_font_size = "1.5em";

const fade_out = function(d){

  this.svg.selectAll("g.tick-group")
    .filter(dd=> d !== dd)
    .selectAll("rect")
    .transition()
    .duration(1000)
    .style("fill-opacity" , 0.2);

  this.svg.selectAll("g.tick-group")
    .filter(dd=> d === dd)
    .selectAll("rect")
    .transition()
    .duration(1000)
    .style("fill-opacity" , 1);

  this.html.selectAll("div.tick")
    .filter(dd=> d !== dd)
    .styles({
      "opacity":0.4,
      "font-weight":"300",
    });

  this.html.selectAll("div.tick")
    .filter(dd=> d === dd)
    .styles({
      "opacity":1,
      "font-weight":"500",
    });
};


new PanelGraph({
  key: 'gocographic',
  level: 'gov',
  depends_on: ['table6', 'table12'],
  footnotes: ["GOCA"],
  calculate: _.constant(true),
  render,
});

class Goco {
  constructor(container, history){
    this.history = history;
    this.container = container;
    const table6 = Table.lookup("table6");
    const table12 = Table.lookup("table12");
    const spend_col = "{{pa_last_year}}exp";
    const fte_col = "{{pa_last_year}}";
    const legend_area = this.container.select(".legend_area");

    this.colors = d3.scaleOrdinal(d3.schemeCategory10);
    const that = this;

    this.data = _.chain(Tag.gocos_by_spendarea)
      .map(sa=> {
        const children = _.map(sa.children_tags, goco => {
          const spending = d3.sum(goco.programs, p => {
            return table6.programs.get(p) ? _.first(table6.programs.get(p))[spend_col] : 0;
          });
          const ftes = d3.sum(goco.programs, p => {
            return table12.programs.get(p) ? _.first(table12.programs.get(p))[fte_col] : 0;
          });               
          return {
            href : `#orgs/tag/${goco.id}/infograph`,
            tick : goco.name,
            spending,
            ftes,
          };
        });
        const spending = d3.sum(children, c=>c.spending);
        const ftes = d3.sum(children, c=>c.ftes);
        return {
          tick : sa.name,
          spending,
          ftes,
          children : _.sortBy(children,d=>-d.spending),
        };
      })
      .sortBy(d=>-d.spending)
      .value();

    
    if(window.is_a11y_mode){
      container.select(".graph_area").remove();

      const table_data = _.map(this.data, ({tick, spending, ftes}) => ({
        label: tick,
        /* eslint-disable react/jsx-key */
        data: [
          <Format type="compact1" content={spending} />,
          <Format type="big_int_real" content={ftes} />,
        ],
      }));

      charts_index.create_a11y_table({
        label_col_header: [ text_maker("spend_area")],
        data_col_headers: [text_maker("dp_spending"), text_maker("dp_ftes")],
        data: table_data,
        container: container.select(".a11y_area"),
      });

      return; 

    } else {
      container.select(".a11y_area").remove();
    }

    




    const series1 = {
      label :  text_maker("spending"), 
      data : _.map(this.data,"spending"),
      formater : formats.compact1,
    };
    const series2 =  {
      label : text_maker("ftes") , 
      data : _.map(this.data,"ftes"),
      formater : formats.big_int_real,
    };

    reactAdapter.render(
      <GraphLegend
        isHorizontal={true} 
        items={ 
          _.map([series1, series2], ({label}) => ({
            active: true,
            label,
            id: label,
            color: this.colors(label),
          }))
        }
      />,
      legend_area.node()
    )

    const graph = new charts_index.TWO_SERIES_BAR.TWO_SERIES_BAR(
      this.container.select('.sa-diagram').node(),
      {
        title_font_size,
        title : text_maker("gov_goco"),
        colors : this.colors,
        height: 380,
        ticks : _.map(this.data,"tick"),
        series1,
        series2,
      }
    )

    graph.dispatch.on("dataClick.fade_out", fade_out.bind(graph));
    graph.dispatch.on("dataClick.render",this.render_goco.bind(this) );

    graph.render();
    if (state.active_spend_area) {
      graph.dispatch.on("renderEnd", ()=> {
        that.render_goco( state.active_spend_area);
        fade_out.call(graph,state.active_spend_area);
        graph.dispatch.on("renderEnd",null);
      });
    }
  }

  render_goco(sa_name){
    
    state.active_spend_area = sa_name;
    this.goco_data = _.find(this.data, d=>d.tick === sa_name).children;
    this.container.select('.goco-diagram').html("");

    const graph = new charts_index.TWO_SERIES_BAR.TWO_SERIES_BAR(
      this.container.select('.goco-diagram').node(),
      {
        title : sa_name,
        colors : this.colors,
        title_font_size,
        height: 380,
        ticks : _.map(this.goco_data,"tick"),
        series1 : {
          label :  text_maker("spending"), 
          data : _.map(this.goco_data,"spending"),
          formater : formats.compact1,
        },
        series2 : {
          label : text_maker("ftes"), 
          data : _.map(this.goco_data,"ftes"),
          formater : formats.big_int_real,
        },
      }
    )
    graph.render();
    graph.dispatch.on("dataClick",this.nav_to_dashboard.bind(this) );
  }
  nav_to_dashboard(goco_name){
    const goco =  _.find(this.goco_data, d=>d.tick ===goco_name);
    const href = goco.href.replace("#","/");
    this.history.push(href);
  }
}

function render({calculations, footnotes, sources }, { history }){

  const table6 = Table.lookup("table6");
  const table12 = Table.lookup("table12");

  const spend_yr = "{{pa_last_year}}exp";
  const fte_yr = "{{pa_last_year}}";

  const fte_spend_data = _.chain(Tag.gocos_by_spendarea)
    .map(sa=> {
      const children = _.map(sa.children_tags, goco => {
        const spending = d3.sum(goco.programs, p => {
          return table6.programs.get(p) ? _.first(table6.programs.get(p))[spend_yr] : 0;
        });
        const ftes = d3.sum(goco.programs, p => {
          return table12.programs.get(p) ? _.first(table12.programs.get(p))[fte_yr] : 0;
        });             
        return {
          spending,
          ftes,
        };
      });
      const spending = d3.sum(children, c=>c.spending);
      const ftes = d3.sum(children, c=>c.ftes);
      return {
        sa_name: sa.name,
        spending,
        ftes,
      };
    })
    .sortBy(d=>-d.spending)
    .value();

  const total_fte_spend = {
    max_sa: _.first(_.map(fte_spend_data,"sa_name")),
    max_sa_share: (_.first(_.map(fte_spend_data,"spending")) / d3.sum(_.map(fte_spend_data, "spending"))),
    spending: d3.sum(_.map(fte_spend_data, "spending")),
    ftes: d3.sum(_.map(fte_spend_data, "ftes")),
  }
  return (
    <Panel
      title={text_maker("gocographic_title")}
      {...{sources,footnotes}}
    >
      <div className="medium_panel_text">
        <TM k="goco_intro_text" args={total_fte_spend}/>
      </div>
      <GocoDiagram 
        history={history}
      />
    </Panel>
  );
}

class GocoDiagram extends React.Component {
  componentDidMount(){
    const { el } = this;
    const { history } = this.props;
    d3.select(el)
      .append("div")
      .attr("id", "goco_mount")
      .html(text_maker("goco_t"));

    new Goco(
      d3.select(el.querySelector("#goco_mount")), 
      history
    );
  }

  render(){
    return <div ref={el=> this.el = el} />;
  }
}

