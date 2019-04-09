import {
  PanelGraph,
  businessConstants,
  years,
  util_components,
  Panel,
  declarative_charts,
  run_template,
  NivoResponsiveLine,
} from "../shared.js";
import { text_maker, TM } from './sobj_text_provider.js';
const { 
  GraphLegend,
  A11YTable,
} = declarative_charts;
const { sos } = businessConstants;
const { std_years } = years;
const { Format } = util_components;

new PanelGraph({
  level: "dept",
  key: "spend_by_so_hist",
  depends_on: ['orgSobjs'],
  footnotes: [ "SOBJ", "EXP"],
  info_deps: [ 'orgSobjs_dept_info', 'orgSobjs_gov_info' ],
  calculate (subject,info){
    const {orgSobjs} = this.tables;
    return {
      data: (
        _.chain(sos)
          .sortBy(sobj => sobj.so_num )
          .map(sobj => 
            ({
              "label": sobj.text,
              "data": std_years.map( year => orgSobjs.so_num(year,subject)[sobj.so_num]),
            })
          )
          .filter(d => d3.sum(d.data) )
          .value()
      ),
      ticks: info.last_years,
    };
  },
  render({calculations, footnotes, sources}){
    const { graph_args, info } = calculations;
    const {ticks, data} = graph_args;
  
    let graph_content;
    if(window.is_a11y_mode){
      graph_content = (
        <A11YTable
          data={
            _.map(data, ({label, data}) => ({
              label,
              /* eslint-disable react/jsx-key */
              data: data.map(amt => <Format type="compact1" content={amt} />),
            }))
          }
          label_col_header={text_maker("so")}
          data_col_headers={ticks} 
        />
      );
    } else {
      graph_content = (
        <SobjLine data={data} />
      );
    }

    return (
      <Panel
        title={text_maker("dept_fin_spend_by_so_hist_title")}
        {...{sources, footnotes}}
      >
        <div className="medium_panel_text">
          <TM k="dept_fin_spend_by_so_hist_text" args={info}/>
        </div>
        <div>
          {graph_content}
        </div>
      </Panel>
    );
  },   
  
});

class SobjLine extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      active_sobjs: [_.first(props.data).label ],
    }
    this.colors = infobase_colors();
  }
  render(){
    const { data } = this.props;
    const { active_sobjs } = this.state;
    const { colors } = this;

    const legend_items = _.map(data, ({label}) => ({
      label,
      id: label,
      active: _.includes(active_sobjs, label),
      color: colors(label),
    }));
    
    const graph_series = _.chain(data)
      .filter( ({label}) => _.includes(active_sobjs, label ))
      .map( ({label, data}) => [label, data] )
      .fromPairs()
      .value();

    const years = _.map(std_years,run_template);
    const spending_data = _.map(
      graph_series,
      (spending_array, spending_label) => ({
        id: spending_label,
        data: spending_array.map(
          (spending_value, year_index) => ({
            x: years[year_index],
            y: spending_value,
          })
        ),
      })
    );

    return (
      <div className="frow">
        <div className="fcol-md-4">
          <div className="legend-container">
            <GraphLegend
              items={legend_items}
              onClick={ 
                id => {
                  !(
                    spending_data.length === 1 && 
                    spending_data.map(o => o.id).includes(id) 
                  ) && this.setState({ active_sobjs: _.toggle_list(active_sobjs, id) })
                }
              }
            />
          </div>
        </div>
        <div className="fcol-md-8" style={{height: '500px'}}>
          <NivoResponsiveLine
            data = {spending_data.reverse()}
            margin = {{
              top: 10,
              right: 30,
              bottom: 90,
              left: 70,
            }}
            colorBy={d => colors(d.id)}
          />
        </div>
      </div>
    );
  }
}
