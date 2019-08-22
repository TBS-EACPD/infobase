import text from "./goco.yaml";
import { Fragment } from 'react';
import {
  create_text_maker_component,
  declare_panel,
  Subject,
  formats,
  declarative_charts,
  Panel,
  Table,
  newIBCategoryColors,
  NivoResponsiveBar,
  TspanLineWrapper,
} from '../shared.js';

const { GraphLegend, A11YTable } = declarative_charts;
const { Tag } = Subject;

const { text_maker, TM } = create_text_maker_component(text);

class Goco extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      child_graph: false,
      clicked_spending: false,
      clicked_fte: false,
    };
  }
  render(){
    const { child_graph, clicked_spending, clicked_fte } = this.state;
    const programSpending = Table.lookup("programSpending");
    const programFtes = Table.lookup("programFtes");
    const spend_col = "{{pa_last_year}}exp";
    const fte_col = "{{pa_last_year}}";
    const series_labels = [text_maker("spending"), text_maker("ftes")];

    let graph_content;

    const tick_map = {};
    const fte_factor = 500000;
    const colors = d3.scaleOrdinal().range(newIBCategoryColors);

    const data = _.chain(Tag.gocos_by_spendarea)
      .map(sa=> {
        const children = _.map(sa.children_tags, goco => {
          const Spending = programSpending.q(goco).sum(spend_col);
          const FTEs = programFtes.q(goco).sum(fte_col) * fte_factor;
          tick_map[`${goco.name}`] = `#orgs/tag/${goco.id}/infograph`;
          return {
            label: goco.name,
            Spending,
            FTEs,
          };
        });
        const Spending = d3.sum(children, c => c.Spending);
        const FTEs = d3.sum(children, c => c.FTEs);
        return {
          label: sa.name,
          Spending,
          FTEs,
          children: _.sortBy(children, d => -d.spending),
        };
      })
      .sortBy(d => -d.spending)
      .value();
    
    if(window.is_a11y_mode){
      const a11y_data = _.chain(data)
        .map(row => {
          return {
            label: row.label,
            data: [formats.compact1_raw(row.Spending), formats.big_int_real_raw(row.FTEs / fte_factor)],
          };
        })
        .value();
      
      graph_content = (
        <A11YTable
          data_col_headers={series_labels}
          data={a11y_data}
        />
      );
    } else {
      const legend_items = _.map(series_labels, (label) => {
        return {
          id: label,
          label: label,
          color: colors(label),
        };
      });
      
      const format_item = (item) => item.id === text_maker("ftes") ? formats.big_int_real_raw(item.value / fte_factor)
        : formats.compact1_raw(item.value);
  
      const nivo_default_props = {
        data: data,
        indexBy: "label",
        remove_left_axis: true,
        enableLabel: true,
        enableGridX: false,
        enableGridY: false,
        label: d => format_item(d),
        tooltip: (slice) =>
          (<div style={{color: window.infobase_color_constants.textColor}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <tbody>
                { slice.map(
                  tooltip_item => (
                    <tr key = {tooltip_item.id}>
                      <td style= {{padding: '3px 5px'}}>
                        <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.color}} />
                      </td>
                      <td style={{padding: '3px 5px'}}> {tooltip_item.id} </td>
                      <td
                        style={{padding: '3px 5px'}}
                        dangerouslySetInnerHTML={{ __html: format_item(tooltip_item) }}
                      />
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>),
        padding: 0.1,
        colorBy: d => colors(d.id),
        keys: series_labels,
        groupMode: "grouped",
        width: 200,
        height: 400,
        margin: {
          top: 10,
          right: 0,
          bottom: 45,
          left: 0,
        },
      };
    
      const toggleOpacity = (element) => {
        const current_opacity = element.style.opacity;
        element.style.opacity = current_opacity === '1' || !current_opacity ? 0.4 : 1;
      };
    
      const handleHover = (node, targetElement) => {
        const allGroupedElements = targetElement.parentElement.parentElement;
        const target_spending = allGroupedElements.children.item(node.index);
        const target_fte = allGroupedElements.children.item(node.index + data.length);
        if(!_.isEqual(target_spending, clicked_spending) && !_.isEqual(target_fte, clicked_fte)){
          if(target_spending) { toggleOpacity(target_spending); }
          if(target_fte) { toggleOpacity(target_fte); }
          _.forEach(allGroupedElements.parentElement.querySelectorAll("text"),
            (textElement) => {
              if(textElement.textContent === node.indexValue){
                toggleOpacity(textElement);
                return;
              }
            });
        }
      };
  
      const handleClick = (node, targetElement) => {
        const allGroupedElements = targetElement.parentElement.parentElement;
        const target_spending = allGroupedElements.children.item(node.index);
        const target_fte = allGroupedElements.children.item(node.index + data.length);
        _.forEach(allGroupedElements.children, (bar_element) => {
          bar_element.style.opacity = bar_element === target_spending || bar_element === target_fte ? 1 : 0.4;
        });
        _.forEach(allGroupedElements.parentElement.querySelectorAll("text"),
          (textElement) => {
            textElement.style.opacity = textElement.textContent === node.indexValue ? 1 : 0.4;
          });
  
        nivo_default_props.data = node.data.children;
        const child_graph = (
          <Fragment>
            <h4 style={{textAlign: "center"}}> { node.indexValue } </h4>
            <NivoResponsiveBar
              {...nivo_default_props}
              bttm_axis={{
                renderTick: tick => {
                  return <g key={tick.key} transform={`translate(${tick.x + 60},${tick.y + 16})`}>
                    <a
                      href={tick_map[tick.value]}
                      target="_blank" rel="noopener noreferrer"
                    >
                      <text
                        textAnchor="end"
                        dominantBaseline="end"
                        style={{
                          ...tick.theme.axis.ticks.text,
                        }}
                      >
                        <TspanLineWrapper text={tick.value} width={20}/>
                      </text>
                    </a>
                  </g>;
                },
              }}
            />
          </Fragment>
        );
        this.setState({
          child_graph: child_graph,
          clicked_spending: target_spending,
          clicked_fte: target_fte,
        });
      };
      graph_content = <Fragment>
        <div style={{padding: '10px 25px 10px 25px'}}>
          <div className="legend-container">
            <GraphLegend
              isHorizontal
              items={legend_items}
            />
          </div>
        </div>
        <div style={{height: 400}}>
          <NivoResponsiveBar
            {...nivo_default_props}
            onMouseEnter={(node, e) => handleHover(node, e.target) }
            onMouseLeave={(node, e) => handleHover(node, e.target) }
            onClick={(node, e) => handleClick(node, e.target)}
            bttm_axis={{
              renderTick: tick => {
                return <g key={tick.key} transform={`translate(${tick.x + 40},${tick.y + 16})`}>
                  <text
                    textAnchor="end"
                    dominantBaseline="end"
                    style={{
                      ...tick.theme.axis.ticks.text,
                    }}
                  >
                    <TspanLineWrapper text={tick.value} width={15}/>
                  </text>
                </g>;
              },
            }}
          />
        </div>
      </Fragment>;  
    }
    return <Fragment>
      { graph_content }
      { child_graph &&
          <div style={{height: 300, paddingBottom: 30}}>
            { child_graph }
          </div>
      }
    </Fragment>;
  }
}

function render({ footnotes, sources }){

  const programSpending = Table.lookup("programSpending");
  const programFtes = Table.lookup("programFtes");

  const spend_yr = "{{pa_last_year}}exp";
  const fte_yr = "{{pa_last_year}}";

  const fte_spend_data = _.chain(Tag.gocos_by_spendarea)
    .map(sa => {
      const children = _.map(sa.children_tags, goco => {
        const spending = d3.sum(goco.programs, p => {
          return programSpending.programs.get(p) ? _.first(programSpending.programs.get(p))[spend_yr] : 0;
        });
        const ftes = d3.sum(goco.programs, p => {
          return programFtes.programs.get(p) ? _.first(programFtes.programs.get(p))[fte_yr] : 0;
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
  };
  return (
    <Panel
      title={text_maker("gocographic_title")}
      {...{sources,footnotes}}
    >
      <Goco/>
      <div className="medium_panel_text">
        <TM k="goco_intro_text" args={total_fte_spend}/>
      </div>
    </Panel>
  );
}

new PanelGraph({
  key: 'gocographic',
  level: 'gov',
  depends_on: ['programSpending', 'programFtes'],
  footnotes: ["GOCO"],
  render,
});
