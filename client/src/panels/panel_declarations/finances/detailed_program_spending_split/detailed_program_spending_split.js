import text from './detailed_program_spending_split.yaml';
import {
  NivoResponsiveBar,
  NivoResponsiveHBar,
  Subject,
  formats,
  run_template,
  util_components,
  infograph_href_template,
  year_templates,
  declarative_charts,
  businessConstants,
  InfographicPanel,
  FootNote,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,

  declare_panel,

  TspanLineWrapper,
  HeightClippedGraph,
} from "../../shared.js";

const { std_years } = year_templates; 

const { 
  create_text_maker_component,
  Select,
  Format,
} = util_components;

const {
  GraphLegend,
  A11YTable,
} = declarative_charts;

const { sos } = businessConstants;

const { text_maker, TM } = create_text_maker_component(text);

const footnote_topics = ['PROG', 'SOBJ'];

class HistoricalProgramBars extends React.Component {
  constructor(props){
    super(props);
    const { data } = this.props;

    //start by picking the 3 largest programs that existed in pa_last_year
    const active_last_year_progs = _.chain(data)
      .sortBy(({data}) => _.last(data) || 0)
      .takeRight(3)
      .map('id')
      .value();

    this.state = {
      selected: active_last_year_progs,
    };
  }
  render(){
    const { data } = this.props;
    const ticks = std_years.map(yr => run_template(yr));
    const { selected } = this.state;

    const colors = d3.scaleOrdinal().range(_.concat(newIBLightCategoryColors, newIBDarkCategoryColors ));
    const graph_data = _.chain(data)
      .filter( ({id}) => _.includes(selected, id) )
      .map( ({label, data }) => [ label, data ])
      .fromPairs()
      .value();
    
    //have to have an empty string in key to make sure
    //that negative bars will be displayed
    const data_formatter = _.map(
      ticks,
      (year, year_index) => ({
        year,
        ..._.chain(graph_data)
          .map( (data, label) => [ label, data[year_index] ] )
          .fromPairs()
          .value(),
      })
    );
  
    if(window.is_a11y_mode){
      return <div>
        <A11YTable 
          table_name={text_maker("historical_prog_title")}
          data={_.map(data, ({label, data})=>({
            label,
            /* eslint-disable react/jsx-key */
            data: data.map(amt => <Format type="compact1_written" content={amt} />),
          }))}
          label_col_header={text_maker("program")}
          data_col_headers={ticks}
        />
      </div>;
    }

    return <div>
      <div className="panel-separator" />
      <div style={{paddingBottom: '10px'}} className='center-text font-xlarge'>
        <strong><TM k="historical_prog_title" /></strong>
      </div>
      <div className="frow">
        <div className="fcol-md-4" style={{ width: "100%" }}>
          <div
            className="legend-container"
            style={{ maxHeight: "400px" }}
          >
            <GraphLegend
              items={_.chain(data)
                .sortBy(({data}) => _.last(data) || 0 )
                .reverse()
                .map( ({ label, id }) => ({
                  label,
                  active: _.includes(selected, id),
                  id,
                  color: colors(label),
                }))
                .value()
              }
              onClick={id => {!(selected.length === 1 && selected.includes(id)) &&
                this.setState({
                  selected: _.toggle_list(selected, id),
                });
              }}
            />
          </div>
        </div>
        <div className="fcol-md-8" style={{ height: '400px' }} aria-hidden = {true}>
          <NivoResponsiveBar
            data = {data_formatter}
            keys = {Object.keys(graph_data)}
            indexBy = "year"
            colorBy ={d => colors(d.id)}
            margin = {{
              top: 50,
              right: 20,
              bottom: 50,
              left: 70,
            }}
          />
        </div>
      </div>
    </div>;
  }
}

class DetailedProgramSplit extends React.Component {
  constructor(){
    super();
    this.state = {
      selected_program: text_maker('all'),
    };
  }
  
  render(){
    const {
      flat_data,
      arrangements,
      top_3_so_nums,
    } = this.props;
    const { selected_program } = this.state;

    const colors = infobase_colors();
    const formatter = formats.compact1_raw;

    const { mapping } = _.find(arrangements, {id: selected_program} );

    if(window.is_a11y_mode){
      return (
        <div className="row">
          <div className="panel-separator" >
            <table className="table table-striped table-bordered">
              <caption><TM k="so_spend_by_prog" /></caption>
              <thead>
                <tr>
                  <th scope="col">
                    <TM k="program"/>
                  </th>
                  <th scope="col">
                    <TM k="so"/>
                  </th>
                  <th scope="col">
                    {run_template("{{pa_last_year}}")} <TM k="expenditures" /> 
                  </th>
                </tr>
              </thead>
              <tbody>
                {_.map( flat_data, ({so_label, program, value }) => 
                  <tr key={program.id+so_label}>
                    <td> {program.name} </td>
                    <td> {so_label} </td>
                    <td> <Format type="compact1_written" content={value} /> </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const legend_items = selected_program === text_maker('all') && 
      _.chain([
        ... _.map(top_3_so_nums, num => sos[num].text),
        text_maker('other_sos'),
        text_maker('revenues'),
      ])
        .map(
          (label) => ({
            label,
            active: true,
            id: label,
            color: colors(label),
          }) 
        )
        .sortBy( ({label}) => label === text_maker('other_sos') )
        .value();

    const so_label_list = selected_program === text_maker('all') ? 
      _.map(legend_items, "label") :
      [selected_program];

    const graph_ready_data = _.chain(flat_data)
      .mapValues( (row) => ({...row, so_label: mapping(row.so_num)}) )
      .filter( (row) => row.value !== 0 && _.includes(so_label_list, row.so_label) )
      .groupBy( (row) => row.program.name )
      .map(
        (group) => ({
          label: _.first(group).program.name,

          ...(
            _.chain(group)
              .groupBy("so_label")
              .map( (so_label_rows, so_label) => [
                so_label,
                _.reduce(
                  so_label_rows,
                  (memo, row) => memo + row.value,
                  0,
                ),
              ])
              .fromPairs()
              .value()
          ),

          total: _.reduce(group, (memo, row) => memo + row.value, 0),
        })
      )
      .sortBy("total")
      .value();

    // Increase height of the graph region for y-axis labels to have sufficient room
    // This is required to corretly display the labels when too many programs are present
    const divHeight = 650 * (graph_ready_data.length / 30) * 2;

    const markers = _.map(
      graph_ready_data,
      ({label, total}) => ({
        axis: 'y',
        value: label,
        lineStyle: {strokeWidth: 0},
        textStyle: {
          fill: total < 0 ? window.infobase_color_constants.highlightColor : window.infobase_color_constants.textColor,
          fontSize: '11px',
        },
        legend: formatter(total),
        legendOffsetX: -60,
        legendOffsetY: -(divHeight / (graph_ready_data.length * 2)),
      })
    );

    const programs_by_name = _.chain(flat_data)
      .map( ({program}) => [program.name, program] )
      .fromPairs()
      .value();

    return <div>
      <div className="panel-separator" />
      <div style={{paddingBottom: '10px'}} className='center-text font-xlarge'>
        <strong><TM k="so_spend_by_prog" /></strong>
      </div>
      <div className="frow">
        <div className="fcol-md-3" style={{ width: "100%" }}>
          <label>
            <TM k="filter_by_so" />
            <Select 
              selected={selected_program}
              options={_.map(arrangements, ({id, label}) => ({ 
                id,
                display: label,
              }))}
              onSelect={id=> {
                this.setState({
                  selected_program: id,
                });
              }}
              style={{
                display: 'block',
                margin: '10px auto',
              }}
              className="form-control"
            />
          </label>
          { legend_items &&
            <div className="legend-container">
              <GraphLegend
                items={legend_items}
                isSolidBox
              />
            </div>
          }
        </div> 
        <div className="fcol-md-9" style={{ width: "100%" }}>
          <div 
            style={{
              height: divHeight,
            }}
          >
            <NivoResponsiveHBar
              data={graph_ready_data}
              indexBy="label"
              keys={so_label_list}
              margin = {{
                top: 10,
                right: 70,
                bottom: 30,
                left: 215,
              }}
              colorBy = {d => colors(d.id)}
              bttm_axis = {{
                tickSize: 5,
                tickPadding: 5,
                tickValues: 6,
                format: (d) => formatter(d),
              }}
              left_axis = {{
                tickSize: 5,
                tickPadding: 5,
                renderTick: tick => (
                  <g key={tick.key} transform={`translate(${tick.x-5},${tick.y+1.5})`}>
                    <a
                      href={programs_by_name[tick.value] ? infograph_href_template(programs_by_name[tick.value]) : null}
                      target="_blank" rel="noopener noreferrer"
                    >
                      <text
                        textAnchor="end"
                        dominantBaseline="end"
                        style={{
                          ...tick.theme.axis.ticks.text,
                        }}
                      >
                        <TspanLineWrapper text={tick.value} width={40}/>
                      </text>
                    </a>
                  </g>
                ),
              }}
              markers = {markers}
              padding = {0.05}
            />
          </div>
        </div>
      </div> 
    </div>;

  }

}


export const declare_detailed_program_spending_split_panel = () => declare_panel({
  panel_key: "detailed_program_spending_split",
  levels: ["dept"],
  panel_config_func: (level, panel_key) => ({
    info_deps: ["programSpending_dept_info"],
    depends_on: ['programSobjs', "programSpending"],

    footnotes: footnote_topics,
    calculate(subject,info,options){
  
      const {programSobjs, programSpending} = this.tables;

      const table_data = programSobjs.q(subject).data;

      if(_.isEmpty(table_data)){
        return false;
      }

      const flat_data = _.map(table_data, row => ({
        program: Subject.Program.get_from_activity_code(row.dept, row.activity_code),
        so_num: row.so_num,
        so_label: row.so,
        value: row["{{pa_last_year}}"],
      }));

      const top_3_so_nums = _.chain(flat_data)
        .compact()
        .groupBy('so_num')
        .toPairs()
        .map( ([so_num, group]) => ({
          so_num: +so_num, 
          sum: d3.sum(group, _.property('value')),
        }))
        .sortBy('sum')
        .reverse()
        .map('so_num')
        .take(3)
        .value();


      //maps so_nums to new so_labels
      const higher_level_mapping = so_num => {
        if(+so_num > 19){
          return text_maker('revenues');
        } else if(_.includes(top_3_so_nums, +so_num)){
          return sos[+so_num].text;
        } else {
          return text_maker('other_sos');
        }
      };

      const exp_cols = _.map(std_years, yr=>yr+"exp");
      const programSpending_data = _.chain(programSpending.q(subject).data)
        .filter(row => {
          return d3.sum(exp_cols, col=> row[col]) !== 0;
        })
        .map(row => 
          ({
            label: row.prgm,
            data: exp_cols.map(col => row[col]),
            active: false,
          })
        )
        .sortBy(x => -d3.sum(x.data))
        .value();

      const program_footnotes = _.chain(flat_data)
        .map( ({program}) => program)
        .uniqBy( program => program.activity_code)
        .flatMap( program => _.chain(
          FootNote.get_for_subject(
            program,
            [ 
              ...footnote_topics,
              "EXP",
            ]
          ) )
          .map( footnote => ({
            ...footnote,
            text: `<strong>${footnote.subject.name}: </strong>${footnote.text}`,
          }) )
          .value()
        )
        .filter()
        .value();

      return {
        top_3_so_nums,
        flat_data,
        higher_level_mapping,
        programSpending_data,
        program_footnotes,
      };

    },

    render({calculations, footnotes, sources}){
      const {
        panel_args: {
          flat_data,
          higher_level_mapping,
          top_3_so_nums,
          programSpending_data,
          program_footnotes,
        },
        info,
      } = calculations;

      const filter_to_specific_so = so_num => test_so_num => (
        test_so_num === so_num ? 
        sos[+so_num].text : 
        null
      );

      const arrangements = [ 
        {
          label: text_maker('all'),
          id: text_maker('all'),
          mapping: so_num => higher_level_mapping(so_num),
        },
      ].concat( _.chain(flat_data)
        .map('so_num')
        .uniqBy()
        .map(so_num => ({
          id: sos[so_num].text,
          label: sos[so_num].text,
          mapping: filter_to_specific_so(so_num),
        }))
        .sortBy('label')
        .value()
      );

      return (
        <InfographicPanel
          title={text_maker("detailed_program_spending_split_title")}
          {...{sources, footnotes: [...footnotes, ...program_footnotes]}}
        >
          <div className="medium_panel_text">
            <TM k={"dept_historical_program_spending_text"} args={info} /> 
          </div>
          <div>
            <div>
              <HistoricalProgramBars
                data={_.map(programSpending_data, ({label,data},ix) => ({
                  label,
                  data,
                  id: `${ix}-${label}`, //need unique id, program names don't always work!
                }))}
              />
            </div>
            <div>
              <HeightClippedGraph clipHeight={300}>
                <DetailedProgramSplit
                  flat_data={flat_data}
                  arrangements={arrangements}
                  top_3_so_nums={top_3_so_nums}
                />
              </HeightClippedGraph>
            </div>
          </div>
        </InfographicPanel>
      );
    },
  }),
});
