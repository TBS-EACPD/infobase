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
    const spending_text = text_maker("spending");
    const ftes_text = text_maker("ftes");

    let graph_content;

    const fte_factor = 400000;
    const colors = d3.scaleOrdinal().range(newIBCategoryColors);

    const graph_data = _.chain(Tag.gocos_by_spendarea)
      .map(sa=> {
        const children = _.map(sa.children_tags, goco => {
          const spending = programSpending.q(goco).sum(spend_col);
          const ftes = programFtes.q(goco).sum(fte_col) * fte_factor;
          return {
            label: goco.name,
            [spending_text]: spending,
            [ftes_text]: ftes,
          };
        });
        const spending = d3.sum(children, c => c[spending_text]);
        const ftes = d3.sum(children, c => c[ftes_text]);
        return {
          label: sa.name,
          [spending_text]: spending,
          [ftes_text]: ftes,
          children: _.sortBy(children, d => -d[spending_text]),
        };
      })
      .sortBy(d => -d[spending_text])
      .value();
    
    const total_fte_spend = _.reduce(graph_data, (result, row) => {
      result.total_spending = result.total_spending + row[spending_text];
      result.total_ftes = result.total_ftes + (row[ftes_text] / fte_factor);
      return result;
    }, {
      total_spending: 0,
      total_ftes: 0,
    });
    const maxSpending = _.maxBy(graph_data, spending_text);
    const spend_fte_text_data = {
      ...total_fte_spend,
      max_sa: maxSpending.label,
      max_sa_share: maxSpending[spending_text] / total_fte_spend.total_spending,
    };
    
    if(window.is_a11y_mode){
      const a11y_data = _.map(graph_data, row => {
        return {
          label: row.label,
          data: [formats.compact1_raw(row.Spending), formats.big_int_real_raw(row.FTEs / fte_factor)],
        };
      });
      
      const a11y_children = _.reduce( graph_data, (result, row) => {
        result.push(
          {
            parent_label: row.label,
            child_data: _.map(row.children, (child) => {
              return {
                label: child.label,
                data: [formats.compact1_raw(child.Spending), formats.big_int_real_raw(child.FTEs / fte_factor)],
              };
            }),
          }
        );
        return result;
      }, [] );

      graph_content = (
        <Fragment>
          <A11YTable
            label_col_header={text_maker("spend_area")}
            data_col_headers={series_labels}
            data={a11y_data}
          />
          { _.map( a11y_children, (child, i) =>
            <A11YTable
              key={i}
              table_name={child.parent_label}
              data_col_headers={series_labels}
              data={child.child_data}
            /> )
          }
        </Fragment>
      );
    } else {
      const legend_items = _.map(series_labels, (label) => {
        return {
          id: label,
          label: label,
          color: colors(label),
        };
      });
      
      const format_item = (item) => item.id === ftes_text
        ? formats.big_int_real_raw(item.value / fte_factor)
        : formats.compact1_raw(item.value);
  
      const nivo_default_props = {
        borderWidth: 1,
        indexBy: "label",
        animate: false,
        remove_left_axis: true,
        enableLabel: true,
        enableGridX: false,
        enableGridY: false,
        label: d => format_item(d),
        label_format: d => <tspan y={-3}> { d } </tspan>,
        tooltip: (slice) =>
          <div style={{color: window.infobase_color_constants.textColor}}>
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
          </div>,
        padding: 0.1,
        colorBy: d => colors(d.id),
        keys: series_labels,
        groupMode: "grouped",
        width: 200,
        height: 400,
        margin: {
          top: 20,
          right: 0,
          bottom: 45,
          left: 0,
        },
      };

      const toggleOpacity = (element) => {
        const current_opacity = element.style.opacity;
        element.style.opacity = current_opacity === '1' || !current_opacity ? 0.4 : 1;
      };

      const generate_index_map = (data) => {
        let hoverIndex = 0;
        const hover_index_spending = _.map(data, (row) => {
          if(row[spending_text] > 0) {
            return hoverIndex++;
          }
        });
        const hover_index_ftes = _.map(data, (row) => {
          if(row[ftes_text] > 0) {
            return hoverIndex++;
          }
        });
        return _.zipObject( _.map(data, 'label'), _.zip(hover_index_spending, hover_index_ftes) );
      };
      
      const handleHover = (node, targetElement, data) => {
        const allGroupedElements = targetElement.parentElement.parentElement;
        const childrenGroupedElements = _.map( _.drop(allGroupedElements.children, 2), _.identity );
        const hover_index_map = generate_index_map(data);
        const target_spending = childrenGroupedElements[hover_index_map[node.indexValue][0]];
        const target_fte = childrenGroupedElements[hover_index_map[node.indexValue][1]];

        if(!_.isEqual(target_spending, clicked_spending) && !_.isEqual(target_fte, clicked_fte)){
          target_spending && toggleOpacity(target_spending);
          target_fte && toggleOpacity(target_fte);
          _.forEach(allGroupedElements.parentElement.querySelectorAll("text"),
            (textElement) => {
              const target_text = textElement.textContent.replace(/\s+/g, '');
              if(target_text === node.indexValue.replace(/\s+/g, '') ||
                target_text === (target_spending && target_spending.getElementsByTagName("text")[0].textContent.replace(/\s+/g, '')) ||
                target_text === (target_fte && target_fte.getElementsByTagName("text")[0].textContent.replace(/\s+/g, ''))
              ){
                toggleOpacity(textElement);
                return;
              }
            });  
        }
      };

      const tick_map = _.reduce(Tag.gocos_by_spendarea, (final_result, sa) => {
        const sa_href_result = _.reduce(sa.children_tags, (child_result, goco) => {
          child_result[`${goco.name}`] = `#orgs/tag/${goco.id}/infograph`;
          return child_result;
        }, {});
        return _.assignIn(sa_href_result, final_result);
      }, {});

      const handleClick = (node, targetElement, data) => {
        const allGroupedElements = targetElement.parentElement.parentElement;
        const childrenGroupedElements = _.map( _.drop(allGroupedElements.children, 2), _.identity );

        const click_index_map = generate_index_map(data);
        const target_spending = childrenGroupedElements[click_index_map[node.indexValue][0]];
        const target_fte = childrenGroupedElements[click_index_map[node.indexValue][1]];

        _.forEach(childrenGroupedElements, (element) => {
          element.style.opacity = 0.4;
        });
        _.forEach(allGroupedElements.parentElement.querySelectorAll("text"),
          (textElement) => {
            const target_text = textElement.textContent.replace(/\s+/g, '');
            textElement.style.opacity = 
              target_text === node.indexValue.replace(/\s+/g, '') ||
              target_text === (target_spending && target_spending.getElementsByTagName("text")[0].textContent.replace(/\s+/g, '')) ||
              target_text === (target_fte && target_fte.getElementsByTagName("text")[0].textContent.replace(/\s+/g, ''))
              ? 1 : 0.4;
          });
        target_spending && toggleOpacity(target_spending);
        target_fte && toggleOpacity(target_fte);
  
        const child_graph = (
          <Fragment>
            <h4 style={{textAlign: "center"}}> { node.indexValue } </h4>
            <NivoResponsiveBar
              { ...nivo_default_props }
              data={ node.data.children }
              onMouseEnter={ (child_node, e) => handleHover(child_node, e.target, node.data.children) }
              onMouseLeave={ (child_node, e) => handleHover(child_node, e.target, node.data.children) }  
              onClick={ (child_node, e) => window.open(tick_map[child_node.indexValue], '_blank') }
              bttm_axis={{
                renderTick: tick => {
                  return <g key={tick.key} transform={ `translate(${tick.x + 25},${tick.y + 16})` }>
                    <a
                      href={ tick_map[tick.value] }
                      target="_blank" rel="noopener noreferrer"
                    >
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
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
        <div style={ {padding: '10px 25px 10px 25px'} }>
          <div className="legend-container">
            <GraphLegend
              isHorizontal
              items={legend_items}
            />
          </div>
        </div>
        <div style={{height: 400}}>
          <NivoResponsiveBar
            { ...nivo_default_props }
            data={ graph_data }
            onMouseEnter={ (node, e) => handleHover(node, e.target, graph_data) }
            onMouseLeave={ (node, e) => handleHover(node, e.target, graph_data) }
            onClick={ (node, e) => handleClick(node, e.target, graph_data) }
            bttm_axis={{
              renderTick: tick => {
                return <g key={tick.key} transform={ `translate(${tick.x + 25},${tick.y + 16})` }>
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
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
      <div className="medium_panel_text">
        <TM k="goco_intro_text" args={ spend_fte_text_data }/>
      </div>
      { graph_content }
      { child_graph &&
          <div style={ {height: 500, paddingBottom: 30} }>
            { child_graph }
          </div>
      }
    </Fragment>;
  }
}

function render({ footnotes, sources }){
  return (
    <Panel
      title={ text_maker("gocographic_title") }
      { ...{sources,footnotes} }
    >
      <Goco/>
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
