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
          const spending = programSpending.q(goco).sum(spend_col);
          const ftes = programFtes.q(goco).sum(fte_col) * fte_factor;
          tick_map[`${goco.name}`] = `#orgs/tag/${goco.id}/infograph`;
          return {
            label: goco.name,
            [text_maker("spending")]: spending,
            [text_maker("ftes")]: ftes,
          };
        });
        const spending = d3.sum(children, c => c[text_maker("spending")]);
        const ftes = d3.sum(children, c => c[text_maker("ftes")]);
        return {
          label: sa.name,
          [text_maker("spending")]: spending,
          [text_maker("ftes")]: ftes,
          children: _.sortBy(children, d => -d[text_maker("spending")]),
        };
      })
      .sortBy(d => -d[text_maker("spending")])
      .value();
    
    const total_fte_spend = _.reduce(data, (result, row) => {
      result.total_spending = result.total_spending + row[text_maker("spending")];
      result.total_ftes = result.total_ftes + (row[text_maker("ftes")] / fte_factor);
      return result;
    }, {
      total_spending: 0,
      total_ftes: 0,
    });
    const maxSpending = _.maxBy(data, text_maker("spending"));
    const spend_fte_text_data = {
      ...total_fte_spend,
      max_sa: maxSpending.label,
      max_sa_share: maxSpending[text_maker("spending")] / total_fte_spend.total_spending,
    };
    
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
        indexBy: "label",
        animate: false,
        remove_left_axis: true,
        enableLabel: true,
        enableGridX: false,
        enableGridY: false,
        label: d => format_item(d),
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
        const childrenGroupedElements = _.map( _.drop(allGroupedElements.children, 2), _.identity );
        const idx_factor = childrenGroupedElements.length / 2;

        let targetElement_idx;
        _.forEach(childrenGroupedElements, (element, index) => {
          if(targetElement.parentElement === element){
            targetElement_idx = index;
            return;
          }
        });
        const is_target_spending = idx_factor > targetElement_idx ? true : false;
        const target_spending = childrenGroupedElements[is_target_spending ?
          targetElement_idx : _.floor(targetElement_idx - idx_factor)];
        const target_fte = childrenGroupedElements[is_target_spending ?
          _.ceil(targetElement_idx + idx_factor) : targetElement_idx];
        if(!_.isEqual(target_spending, clicked_spending) && !_.isEqual(target_fte, clicked_fte)){
          if(target_spending) { toggleOpacity(target_spending); }
          if(target_fte) { toggleOpacity(target_fte); }
          _.forEach(allGroupedElements.parentElement.querySelectorAll("text"),
            (textElement) => {
              if(textElement.textContent.replace(/\s+/g, '') === node.indexValue.replace(/\s+/g, '')){
                toggleOpacity(textElement);
                return;
              }
            });  
        }
      };
  
      const handleClick = (node, targetElement) => {
        const allGroupedElements = targetElement.parentElement.parentElement;
        const childrenGroupedElements = _.map( _.drop(allGroupedElements.children, 2), _.identity );
        const idx_factor = childrenGroupedElements.length / 2;

        let target_spending;
        let target_fte;
        _.forEach(childrenGroupedElements, (element, targetElement_idx) => {
          if(targetElement.parentElement === element){
            const is_target_spending = idx_factor > targetElement_idx ? true : false;
            target_spending = childrenGroupedElements[is_target_spending ?
              targetElement_idx : _.floor(targetElement_idx - idx_factor)];
            target_fte = childrenGroupedElements[is_target_spending ?
              _.ceil(targetElement_idx + idx_factor) : targetElement_idx];

            if(target_spending) { target_spending.style.opacity = 1; }
            if(target_fte) { target_fte.style.opacity = 1; }
          } else if(target_spending != element && target_fte != element){
            element.style.opacity = 0.4;
          }
        });
        _.forEach(allGroupedElements.parentElement.querySelectorAll("text"),
          (textElement) => {
            textElement.style.opacity = 
              textElement.textContent.replace(/\s+/g, '') === node.indexValue.replace(/\s+/g, '') ? 1 : 0.4;
          });
  
        const child_graph = (
          <Fragment>
            <h4 style={{textAlign: "center"}}> { node.indexValue } </h4>
            <NivoResponsiveBar
              { ...nivo_default_props }
              data={ node.data.children }
              onMouseEnter={ (child_node, e) => handleHover(child_node, e.target) }
              onMouseLeave={ (child_node, e) => handleHover(child_node, e.target) }  
              onClick={ (child_node, e) => window.open(tick_map[child_node.indexValue], '_blank') }
              bttm_axis={{
                renderTick: tick => {
                  return <g key={tick.key} transform={ `translate(${tick.x + 60},${tick.y + 16})` }>
                    <a
                      href={ tick_map[tick.value] }
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
            data={ data }
            onMouseEnter={ (node, e) => handleHover(node, e.target) }
            onMouseLeave={ (node, e) => handleHover(node, e.target) }
            onClick={ (node, e) => handleClick(node, e.target) }
            bttm_axis={{
              renderTick: tick => {
                return <g key={tick.key} transform={ `translate(${tick.x + 40},${tick.y + 16})` }>
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
      <div className="medium_panel_text">
        <TM k="goco_intro_text" args={ spend_fte_text_data }/>
      </div>
      { graph_content }
      { child_graph &&
          <div style={ {height: 300, paddingBottom: 30} }>
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
